const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";
const DEFAULT_REPO = "Cliffy3364/Union-Roleplay";
const DEFAULT_BRANCH = "main";
const WIKI_PATH = "data/wiki-articles.json";

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
        }
    });
}

function clean(value, max = 4000) {
    return String(value ?? "")
        .replace(/\u0000/g, "")
        .trim()
        .slice(0, max);
}

function cleanArray(value, maxItems = 40, maxLength = 220) {
    if (!Array.isArray(value)) return [];
    return value
        .map(item => clean(item, maxLength))
        .filter(Boolean)
        .slice(0, maxItems);
}

function slugify(value) {
    return clean(value, 100)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 55) || "article";
}

function bytesToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

function base64ToText(value) {
    const binary = atob(String(value || "").replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function githubHeaders(token = "") {
    const headers = {
        "accept": "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "The-District-Wiki-Publisher"
    };
    if (token) headers.authorization = `Bearer ${token}`;
    return headers;
}

async function validateStaff(authHeader) {
    if (!authHeader?.startsWith("Bearer ")) return null;

    const [meResponse, permissionsResponse] = await Promise.all([
        fetch(`${STAFF_API}/api/auth/me`, {
            headers: { Authorization: authHeader }
        }),
        fetch(`${STAFF_API}/api/staff/permissions`, {
            headers: { Authorization: authHeader }
        })
    ]);

    let me = {};
    let permissions = {};
    try { me = await meResponse.json(); } catch {}
    try { permissions = await permissionsResponse.json(); } catch {}

    if (!meResponse.ok || me?.success !== true || me?.is_staff !== true) return null;
    if (!permissionsResponse.ok || permissions?.success !== true) return null;

    return {
        user: me.user || {},
        permissions
    };
}

function staffName(staff) {
    const user = staff?.user || {};
    return clean(
        user.discord_display_name ||
        user.discord_username ||
        user.username ||
        user.union_id ||
        "District Staff",
        80
    );
}

async function readWikiFile(env) {
    const repo = clean(env.GITHUB_WIKI_REPO, 120) || DEFAULT_REPO;
    const branch = clean(env.GITHUB_WIKI_BRANCH, 80) || DEFAULT_BRANCH;
    const token = clean(env.GITHUB_WIKI_TOKEN, 500);
    const url = `https://api.github.com/repos/${repo}/contents/${WIKI_PATH}?ref=${encodeURIComponent(branch)}`;

    const response = await fetch(url, {
        headers: githubHeaders(token),
        cf: { cacheTtl: 0 }
    });

    if (response.status === 404) {
        return {
            repo,
            branch,
            token,
            sha: null,
            data: { version: 1, updated_at: null, articles: [] }
        };
    }

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Unable to read wiki data from GitHub (${response.status}): ${detail.slice(0, 180)}`);
    }

    const file = await response.json();
    let parsed;
    try {
        parsed = JSON.parse(base64ToText(file.content));
    } catch {
        parsed = { version: 1, updated_at: null, articles: [] };
    }

    if (!Array.isArray(parsed.articles)) parsed.articles = [];

    return {
        repo,
        branch,
        token,
        sha: file.sha || null,
        data: parsed
    };
}

async function writeWikiFile(state, data, commitMessage) {
    if (!state.token) {
        throw new Error("Wiki publishing is not configured. Add GITHUB_WIKI_TOKEN to the Cloudflare Pages Production secrets.");
    }

    const url = `https://api.github.com/repos/${state.repo}/contents/${WIKI_PATH}`;
    const body = {
        message: commitMessage,
        content: bytesToBase64(JSON.stringify(data, null, 2) + "\n"),
        branch: state.branch
    };
    if (state.sha) body.sha = state.sha;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            ...githubHeaders(state.token),
            "content-type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`GitHub rejected the wiki update (${response.status}): ${detail.slice(0, 260)}`);
    }

    return response.json();
}

function sanitiseArticle(input, existing = null) {
    const title = clean(input?.title, 120);
    const summary = clean(input?.summary, 700);
    const body = clean(input?.body, 12000);
    const category = clean(input?.category, 40) || "start";
    const allowedCategories = new Set(["start", "locations", "systems", "services", "roleplay", "support"]);
    const safeCategory = allowedCategories.has(category) ? category : "start";

    const secondary = cleanArray(input?.secondary_categories, 6, 40)
        .filter(item => allowedCategories.has(item) && item !== safeCategory);

    const steps = Array.isArray(input?.steps)
        ? input.steps.slice(0, 20).map(step => ({
            title: clean(step?.title, 100),
            text: clean(step?.text, 500)
        })).filter(step => step.title || step.text)
        : [];

    const facts = Array.isArray(input?.facts)
        ? input.facts.slice(0, 20).map(item => ({
            label: clean(item?.label, 100),
            value: clean(item?.value, 500)
        })).filter(item => item.label || item.value)
        : [];

    if (!title) throw new Error("Article title is required.");
    if (!summary && !body && !steps.length && !facts.length) {
        throw new Error("Add a summary, article body, steps or quick facts before publishing.");
    }

    const now = new Date().toISOString();
    const id = existing?.id || `wiki-${slugify(title)}-${Date.now().toString(36)}`;

    return {
        id,
        ref: existing?.ref || `KB-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        category: safeCategory,
        secondary_categories: secondary,
        search_keywords: clean(input?.search_keywords, 500),
        summary,
        body,
        steps,
        facts,
        callout: clean(input?.callout, 900),
        callout_style: clean(input?.callout_style, 20) === "amber" ? "amber" : "default",
        image_url: clean(input?.image_url, 600),
        featured: input?.featured === true,
        created_at: existing?.created_at || now,
        updated_at: now,
        created_by: existing?.created_by || null,
        updated_by: null
    };
}

export async function onRequestGet(context) {
    try {
        const state = await readWikiFile(context.env);
        const articles = [...state.data.articles]
            .filter(article => article && article.id && article.title)
            .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));

        return json({
            success: true,
            updated_at: state.data.updated_at || null,
            articles
        });
    } catch (error) {
        console.error("Wiki GET error:", error);
        return json({ success: false, error: error?.message || "Unable to load wiki articles." }, 500);
    }
}

export async function onRequestPost(context) {
    try {
        const auth = context.request.headers.get("authorization") || "";
        const staff = await validateStaff(auth);
        if (!staff) {
            return json({ success: false, error: "Staff authentication is required." }, 401);
        }

        const minimumLevel = Number(context.env.WIKI_MIN_STAFF_LEVEL || 0);
        const staffLevel = Number(staff.permissions?.staff_level || 0);
        if (minimumLevel > 0 && staffLevel < minimumLevel) {
            return json({ success: false, error: "Your staff level cannot publish Wiki articles." }, 403);
        }

        let payload;
        try {
            payload = await context.request.json();
        } catch {
            return json({ success: false, error: "Invalid wiki request." }, 400);
        }

        const action = clean(payload?.action, 20).toLowerCase() || "create";
        if (!["create", "update", "delete"].includes(action)) {
            return json({ success: false, error: "Unsupported wiki action." }, 400);
        }

        const state = await readWikiFile(context.env);
        const articles = Array.isArray(state.data.articles) ? [...state.data.articles] : [];
        const actor = staffName(staff);
        const now = new Date().toISOString();
        let article = null;

        if (action === "delete") {
            const id = clean(payload?.id, 120);
            const index = articles.findIndex(item => item?.id === id);
            if (index === -1) return json({ success: false, error: "Wiki article could not be found." }, 404);
            article = articles[index];
            articles.splice(index, 1);
        } else if (action === "update") {
            const id = clean(payload?.id, 120);
            const index = articles.findIndex(item => item?.id === id);
            if (index === -1) return json({ success: false, error: "Wiki article could not be found." }, 404);
            article = sanitiseArticle(payload?.article, articles[index]);
            article.created_by = articles[index].created_by || actor;
            article.updated_by = actor;
            articles[index] = article;
        } else {
            if (articles.length >= 150) {
                return json({ success: false, error: "The dynamic Wiki article limit has been reached." }, 409);
            }
            article = sanitiseArticle(payload?.article);
            article.created_by = actor;
            article.updated_by = actor;
            articles.unshift(article);
        }

        const next = {
            version: 1,
            updated_at: now,
            articles
        };

        const actionLabel = action === "delete" ? "Delete" : action === "update" ? "Update" : "Publish";
        await writeWikiFile(
            state,
            next,
            `${actionLabel} wiki article: ${clean(article?.title, 80) || "District Wiki"}`
        );

        return json({
            success: true,
            action,
            article,
            count: articles.length,
            updated_at: now,
            message: action === "delete"
                ? "Wiki article removed successfully."
                : "Wiki article published successfully."
        });
    } catch (error) {
        console.error("Wiki POST error:", error);
        return json({ success: false, error: error?.message || "Unable to update the Wiki." }, 500);
    }
}

export function onRequestOptions() {
    return new Response(null, { status: 204 });
}
