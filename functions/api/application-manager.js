const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";
const DEFAULT_REPO = "Cliffy3364/Union-Roleplay";
const DEFAULT_BRANCH = "main";
const APPLY_PATH = "js/apply.js";
const BUSINESS_PATH = "js/business-application-config.js";

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
    return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function bytesToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
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
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "The-District-Application-Manager"
    };
    if (token) headers.authorization = `Bearer ${token}`;
    return headers;
}

async function validateStaff(authHeader) {
    if (!authHeader?.startsWith("Bearer ")) return null;
    const [meResponse, permissionsResponse] = await Promise.all([
        fetch(`${STAFF_API}/api/auth/me`, { headers: { Authorization: authHeader } }),
        fetch(`${STAFF_API}/api/staff/permissions`, { headers: { Authorization: authHeader } })
    ]);
    let me = {};
    let permissions = {};
    try { me = await meResponse.json(); } catch {}
    try { permissions = await permissionsResponse.json(); } catch {}
    if (!meResponse.ok || me?.success !== true || me?.is_staff !== true) return null;
    if (!permissionsResponse.ok || permissions?.success !== true) return null;
    return { user: me.user || {}, permissions };
}

function findMatchingBrace(source, start) {
    let depth = 0;
    let quote = "";
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let i = start; i < source.length; i++) {
        const char = source[i];
        const next = source[i + 1];
        if (lineComment) {
            if (char === "\n") lineComment = false;
            continue;
        }
        if (blockComment) {
            if (char === "*" && next === "/") { blockComment = false; i++; }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = "";
            continue;
        }
        if (char === "/" && next === "/") { lineComment = true; i++; continue; }
        if (char === "/" && next === "*") { blockComment = true; i++; continue; }
        if (char === '"' || char === "'") { quote = char; continue; }
        if (char === "{") depth++;
        if (char === "}") {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function stripComments(input) {
    const source = String(input || "");
    let out = "";
    let quote = "";
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        const next = source[i + 1];
        if (lineComment) {
            if (char === "\n") { lineComment = false; out += char; }
            continue;
        }
        if (blockComment) {
            if (char === "*" && next === "/") { blockComment = false; i++; }
            continue;
        }
        if (quote) {
            out += char;
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = "";
            continue;
        }
        if (char === "/" && next === "/") { lineComment = true; i++; continue; }
        if (char === "/" && next === "*") { blockComment = true; i++; continue; }
        if (char === '"' || char === "'") { quote = char; out += char; continue; }
        out += char;
    }
    return out;
}

function jsObjectToJson(literal) {
    let source = stripComments(literal);
    source = source.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
    source = source.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(source);
}

function locateMainConfig(source) {
    const declaration = source.indexOf("const APPLICATION_CONFIG");
    if (declaration === -1) throw new Error("APPLICATION_CONFIG was not found in apply.js.");
    const start = source.indexOf("{", declaration);
    const end = findMatchingBrace(source, start);
    if (start === -1 || end === -1) throw new Error("APPLICATION_CONFIG could not be parsed.");
    return { start, end, config: jsObjectToJson(source.slice(start, end + 1)) };
}

function parseBusinessExtension(source) {
    const marker = 'APPLICATION_CONFIG["Business Ownership Application"]';
    const declaration = source.indexOf(marker);
    if (declaration === -1) return null;
    const equals = source.indexOf("=", declaration);
    const start = source.indexOf("{", equals);
    const end = findMatchingBrace(source, start);
    if (start === -1 || end === -1) return null;
    return jsObjectToJson(source.slice(start, end + 1));
}

async function readGithubFile(repo, branch, path, token) {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
    const response = await fetch(url, { headers: githubHeaders(token), cf: { cacheTtl: 0 } });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Unable to read ${path} from GitHub (${response.status}): ${detail.slice(0, 180)}`);
    }
    const file = await response.json();
    return { sha: file.sha, source: base64ToText(file.content || "") };
}

async function readState(env) {
    const repo = clean(env.GITHUB_APPLICATIONS_REPO, 120) || clean(env.GITHUB_WIKI_REPO, 120) || DEFAULT_REPO;
    const branch = clean(env.GITHUB_APPLICATIONS_BRANCH, 80) || clean(env.GITHUB_WIKI_BRANCH, 80) || DEFAULT_BRANCH;
    const token = clean(env.GITHUB_APPLICATIONS_TOKEN, 500) || clean(env.GITHUB_WIKI_TOKEN, 500);
    const main = await readGithubFile(repo, branch, APPLY_PATH, token);
    const parsed = locateMainConfig(main.source);

    try {
        const business = await readGithubFile(repo, branch, BUSINESS_PATH, token);
        const extra = parseBusinessExtension(business.source);
        if (extra && !parsed.config["Business Ownership Application"]) {
            parsed.config["Business Ownership Application"] = extra;
        }
    } catch {}

    return { repo, branch, token, sha: main.sha, source: main.source, start: parsed.start, end: parsed.end, config: parsed.config };
}

function inferGroup(type) {
    const value = String(type || "").toLowerCase();
    if (value.includes("whitelist")) return "Get Started";
    if (value.includes("business")) return "Businesses";
    if (value.includes("command")) return "Command";
    if (value.includes("developer")) return "Development";
    if (value.includes("media") || value.includes("streamer")) return "Media";
    if (value.includes("staff") || value.includes("qa")) return "Community";
    return "Other";
}

function inferIcon(type) {
    const words = String(type || "Application").replace(/Application/gi, "").trim().split(/\s+/).filter(Boolean);
    return (words.length >= 2 ? `${words[0][0]}${words[1][0]}` : (words[0] || "AP").slice(0, 2)).toUpperCase();
}

function sanitiseQuestion(input, index) {
    const allowedTypes = new Set(["text", "textarea", "number", "email", "url"]);
    const label = clean(input?.label, 1200);
    if (!label) throw new Error(`Question ${index + 1} needs wording.`);
    let key = clean(input?.key, 80).replace(/[^A-Za-z0-9_]/g, "");
    if (!key) key = `question${index + 1}`;
    const type = allowedTypes.has(clean(input?.type, 20)) ? clean(input?.type, 20) : "textarea";
    const minimumLength = Math.max(0, Math.min(5000, Number(input?.minimumLength || 0) || 0));
    return {
        key,
        label,
        type,
        required: input?.required !== false,
        ...(minimumLength > 0 ? { minimumLength } : {})
    };
}

function sanitiseConfig(applicationType, input) {
    const title = clean(input?.title, 140) || applicationType;
    const description = clean(input?.description, 1800);
    if (!description) throw new Error("Application description is required.");
    const questions = Array.isArray(input?.questions) ? input.questions.map(sanitiseQuestion) : [];
    if (!questions.length) throw new Error("Add at least one application question.");
    const keys = new Set();
    for (const question of questions) {
        if (keys.has(question.key)) throw new Error(`Question key '${question.key}' is used more than once.`);
        keys.add(question.key);
    }
    return {
        title,
        description,
        group: clean(input?.group, 60) || inferGroup(applicationType),
        category: clean(input?.category, 80) || (clean(input?.group, 60) || inferGroup(applicationType)).toUpperCase(),
        icon: clean(input?.icon, 4).toUpperCase() || inferIcon(applicationType),
        featured: input?.featured === true,
        questions
    };
}

function normaliseApplications(config) {
    return Object.entries(config || {}).map(([application_type, value]) => ({
        application_type,
        title: value?.title || application_type,
        description: value?.description || "",
        group: value?.group || inferGroup(application_type),
        category: value?.category || inferGroup(application_type).toUpperCase(),
        icon: value?.icon || inferIcon(application_type),
        featured: value?.featured === true || /whitelist/i.test(application_type),
        questions: Array.isArray(value?.questions) ? value.questions : []
    }));
}

async function writeState(state, config, message) {
    if (!state.token) {
        throw new Error("Application publishing is not configured. Add GITHUB_APPLICATIONS_TOKEN or reuse GITHUB_WIKI_TOKEN in the Cloudflare Pages Production secrets.");
    }
    const replacement = JSON.stringify(config, null, 4);
    const source = state.source.slice(0, state.start) + replacement + state.source.slice(state.end + 1);
    const url = `https://api.github.com/repos/${state.repo}/contents/${APPLY_PATH}`;
    const response = await fetch(url, {
        method: "PUT",
        headers: { ...githubHeaders(state.token), "content-type": "application/json" },
        body: JSON.stringify({ message, content: bytesToBase64(source), sha: state.sha, branch: state.branch })
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`GitHub rejected the application update (${response.status}): ${detail.slice(0, 260)}`);
    }
    return response.json();
}

async function authorise(context) {
    const authHeader = context.request.headers.get("authorization") || "";
    const staff = await validateStaff(authHeader);
    if (!staff) return { response: json({ success: false, error: "Staff authentication is required." }, 401) };
    const minimum = Number(context.env.APPLICATIONS_MIN_STAFF_LEVEL || 0);
    const level = Number(staff.permissions?.staff_level || 0);
    if (minimum > 0 && level < minimum) {
        return { response: json({ success: false, error: "Your staff level cannot manage applications." }, 403) };
    }
    return { staff };
}

export async function onRequestGet(context) {
    try {
        const auth = await authorise(context);
        if (auth.response) return auth.response;
        const state = await readState(context.env);
        return json({ success: true, configured: Boolean(state.token), applications: normaliseApplications(state.config) });
    } catch (error) {
        console.error("Application Manager GET error:", error);
        return json({ success: false, error: error?.message || "Unable to load applications." }, 500);
    }
}

export async function onRequestPost(context) {
    try {
        const auth = await authorise(context);
        if (auth.response) return auth.response;
        let payload = {};
        try { payload = await context.request.json(); } catch { return json({ success: false, error: "Invalid Application Manager request." }, 400); }

        const action = clean(payload?.action, 20).toLowerCase();
        if (!["create", "update", "delete"].includes(action)) {
            return json({ success: false, error: "Unsupported application action." }, 400);
        }

        const state = await readState(context.env);
        const config = state.config;
        const originalType = clean(payload?.application_type, 140);
        let affectedType = originalType;

        if (action === "delete") {
            if (!originalType || !config[originalType]) return json({ success: false, error: "That application could not be found." }, 404);
            delete config[originalType];
        } else {
            const newType = clean(payload?.new_application_type || originalType, 140);
            if (!newType) return json({ success: false, error: "Application type/name is required." }, 400);
            const nextConfig = sanitiseConfig(newType, payload?.config || {});

            if (action === "create") {
                if (config[newType]) return json({ success: false, error: "An application with that type already exists." }, 409);
                config[newType] = nextConfig;
            } else {
                if (!originalType || !config[originalType]) return json({ success: false, error: "That application could not be found." }, 404);
                if (newType !== originalType && config[newType]) return json({ success: false, error: "The new application type already exists." }, 409);
                if (newType !== originalType) delete config[originalType];
                config[newType] = nextConfig;
            }
            affectedType = newType;
        }

        const verb = action === "delete" ? "Remove" : action === "update" ? "Update" : "Add";
        await writeState(state, config, `${verb} ${affectedType || "application"} via Staff Panel`);

        return json({
            success: true,
            action,
            application_type: affectedType,
            applications: normaliseApplications(config),
            message: `${verb} application completed. The public Applications page will refresh from the managed catalog automatically.`
        });
    } catch (error) {
        console.error("Application Manager POST error:", error);
        return json({ success: false, error: error?.message || "Unable to update applications." }, 500);
    }
}

export function onRequestOptions() {
    return new Response(null, { status: 204 });
}
