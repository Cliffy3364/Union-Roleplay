const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";
const DEFAULT_REPO = "Cliffy3364/Union-Roleplay";
const DEFAULT_BRANCH = "main";
const RULES_PATH = "js/rules.js";

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
        "user-agent": "The-District-Rules-Manager"
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

    return { user: me.user || {}, permissions };
}

function actorName(staff) {
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

async function readRulesSource(env) {
    const repo = clean(env.GITHUB_RULES_REPO, 120) || clean(env.GITHUB_WIKI_REPO, 120) || DEFAULT_REPO;
    const branch = clean(env.GITHUB_RULES_BRANCH, 80) || clean(env.GITHUB_WIKI_BRANCH, 80) || DEFAULT_BRANCH;
    const token = clean(env.GITHUB_RULES_TOKEN, 500) || clean(env.GITHUB_WIKI_TOKEN, 500);
    const url = `https://api.github.com/repos/${repo}/contents/${RULES_PATH}?ref=${encodeURIComponent(branch)}`;

    const response = await fetch(url, {
        headers: githubHeaders(token),
        cf: { cacheTtl: 0 }
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Unable to read the rulebook from GitHub (${response.status}): ${detail.slice(0, 180)}`);
    }

    const file = await response.json();
    return {
        repo,
        branch,
        token,
        sha: file.sha || null,
        source: base64ToText(file.content || "")
    };
}

function stripJsComments(input) {
    const source = String(input || "");
    let out = "";
    let quote = "";
    let escaped = false;

    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        const next = source[i + 1];

        if (quote) {
            out += char;
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === quote) {
                quote = "";
            }
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            out += char;
            continue;
        }

        if (char === "/" && next === "/") {
            while (i < source.length && source[i] !== "\n") i++;
            out += "\n";
            continue;
        }

        if (char === "/" && next === "*") {
            i += 2;
            while (i < source.length - 1 && !(source[i] === "*" && source[i + 1] === "/")) i++;
            i++;
            continue;
        }

        out += char;
    }

    return out;
}

function locateRulebook(source) {
    const declaration = source.indexOf("const RULEBOOK");
    if (declaration === -1) throw new Error("The RULEBOOK declaration could not be found.");

    const arrayStart = source.indexOf("[", declaration);
    if (arrayStart === -1) throw new Error("The RULEBOOK array could not be found.");

    const marker = source.indexOf("PUNISHMENT COLOURS", arrayStart);
    if (marker === -1) throw new Error("The end of the RULEBOOK could not be identified.");

    const arrayEnd = source.lastIndexOf("];", marker);
    if (arrayEnd === -1 || arrayEnd <= arrayStart) throw new Error("The RULEBOOK closing bracket could not be found.");

    return { arrayStart, arrayEnd };
}

function parseRulebook(source) {
    const { arrayStart, arrayEnd } = locateRulebook(source);
    let literal = source.slice(arrayStart, arrayEnd + 1);
    literal = stripJsComments(literal);

    /* The rulebook source keeps keys on their own lines. Quote only
       those known keys so wording such as "Example: something" inside
       descriptions can never be changed by the parser. */
    literal = literal.replace(
        /^(\s*)(number|title|description|rules|id|punishment|enforcement)\s*:/gm,
        '$1"$2":'
    );
    literal = literal.replace(/,\s*([}\]])/g, "$1");

    let rulebook;
    try {
        rulebook = JSON.parse(literal);
    } catch (error) {
        throw new Error(`The current rulebook could not be parsed safely: ${error.message}`);
    }

    if (!Array.isArray(rulebook)) throw new Error("The current rulebook is not an array.");
    return { rulebook, arrayStart, arrayEnd };
}

function ruleIdParts(id) {
    const match = clean(id, 30).match(/^(\d{1,2})\.(\d{1,3})$/);
    if (!match) return null;
    return {
        section: String(Number(match[1])).padStart(2, "0"),
        number: Number(match[2])
    };
}

function nextRuleId(section) {
    const sectionNumber = clean(section?.number, 4).padStart(2, "0");
    let highest = 0;
    (section?.rules || []).forEach(rule => {
        const parts = ruleIdParts(rule?.id);
        if (parts && parts.section === sectionNumber) highest = Math.max(highest, parts.number);
    });
    return `${sectionNumber}.${highest + 1}`;
}

function sanitiseRule(input, section, existingId = "") {
    const title = clean(input?.title, 140);
    const punishment = clean(input?.punishment, 80) || "3-Strike System";
    const description = clean(input?.description, 1800);
    const enforcement = clean(input?.enforcement, 1800);
    const requestedId = clean(input?.id || existingId, 30);
    const id = requestedId || nextRuleId(section);
    const parts = ruleIdParts(id);
    const expectedSection = clean(section?.number, 4).padStart(2, "0");

    if (!parts || parts.section !== expectedSection) {
        throw new Error(`Rule ID must use the selected section prefix (${expectedSection}.x).`);
    }
    if (!title) throw new Error("Rule title is required.");
    if (!description) throw new Error("Rule description is required.");

    return { id, title, punishment, description, enforcement };
}

function findRule(rulebook, id) {
    for (const section of rulebook) {
        const index = Array.isArray(section.rules)
            ? section.rules.findIndex(rule => clean(rule?.id, 30) === id)
            : -1;
        if (index !== -1) return { section, index, rule: section.rules[index] };
    }
    return null;
}

async function writeRulesSource(state, source, commitMessage) {
    if (!state.token) {
        throw new Error("Rules publishing is not configured. Add GITHUB_RULES_TOKEN or reuse GITHUB_WIKI_TOKEN in the Cloudflare Pages Production secrets.");
    }

    const url = `https://api.github.com/repos/${state.repo}/contents/${RULES_PATH}`;
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            ...githubHeaders(state.token),
            "content-type": "application/json"
        },
        body: JSON.stringify({
            message: commitMessage,
            content: bytesToBase64(source),
            sha: state.sha,
            branch: state.branch
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`GitHub rejected the rulebook update (${response.status}): ${detail.slice(0, 260)}`);
    }

    return response.json();
}

function rebuildSource(state, parsed) {
    const replacement = JSON.stringify(parsed.rulebook, null, 4);
    return state.source.slice(0, parsed.arrayStart) + replacement + state.source.slice(parsed.arrayEnd + 1);
}

async function authorisedState(context) {
    const auth = context.request.headers.get("authorization") || "";
    const staff = await validateStaff(auth);
    if (!staff) return { response: json({ success: false, error: "Staff authentication is required." }, 401) };

    const minimumLevel = Number(context.env.RULES_MIN_STAFF_LEVEL || 0);
    const staffLevel = Number(staff.permissions?.staff_level || 0);
    if (minimumLevel > 0 && staffLevel < minimumLevel) {
        return { response: json({ success: false, error: "Your staff level cannot manage the rulebook." }, 403) };
    }

    return { staff };
}

export async function onRequestGet(context) {
    try {
        const auth = await authorisedState(context);
        if (auth.response) return auth.response;

        const state = await readRulesSource(context.env);
        const parsed = parseRulebook(state.source);

        return json({
            success: true,
            configured: Boolean(state.token),
            rulebook: parsed.rulebook,
            sections: parsed.rulebook.length,
            rules: parsed.rulebook.reduce((sum, section) => sum + (Array.isArray(section.rules) ? section.rules.length : 0), 0)
        });
    } catch (error) {
        console.error("Rules manager GET error:", error);
        return json({ success: false, error: error?.message || "Unable to load the rulebook." }, 500);
    }
}

export async function onRequestPost(context) {
    try {
        const auth = await authorisedState(context);
        if (auth.response) return auth.response;

        let payload;
        try {
            payload = await context.request.json();
        } catch {
            return json({ success: false, error: "Invalid rules manager request." }, 400);
        }

        const action = clean(payload?.action, 30).toLowerCase();
        if (!["create", "update", "delete"].includes(action)) {
            return json({ success: false, error: "Unsupported rules manager action." }, 400);
        }

        const state = await readRulesSource(context.env);
        const parsed = parseRulebook(state.source);
        const rulebook = parsed.rulebook;
        const actor = actorName(auth.staff);
        let affected = null;

        if (action === "delete") {
            const id = clean(payload?.id, 30);
            const found = findRule(rulebook, id);
            if (!found) return json({ success: false, error: "That rule could not be found." }, 404);
            affected = found.rule;
            found.section.rules.splice(found.index, 1);
        } else {
            const sectionNumber = clean(payload?.section_number, 4).padStart(2, "0");
            const section = rulebook.find(item => clean(item?.number, 4).padStart(2, "0") === sectionNumber);
            if (!section) return json({ success: false, error: "Selected rule section could not be found." }, 404);
            if (!Array.isArray(section.rules)) section.rules = [];

            if (action === "create") {
                const rule = sanitiseRule(payload?.rule, section);
                if (findRule(rulebook, rule.id)) {
                    return json({ success: false, error: `Rule ${rule.id} already exists.` }, 409);
                }
                section.rules.push(rule);
                section.rules.sort((a, b) => {
                    const aa = ruleIdParts(a.id)?.number || 0;
                    const bb = ruleIdParts(b.id)?.number || 0;
                    return aa - bb;
                });
                affected = rule;
            } else {
                const originalId = clean(payload?.id, 30);
                const found = findRule(rulebook, originalId);
                if (!found) return json({ success: false, error: "That rule could not be found." }, 404);

                const rule = sanitiseRule(payload?.rule, section, originalId);
                const duplicate = findRule(rulebook, rule.id);
                if (duplicate && duplicate.rule !== found.rule) {
                    return json({ success: false, error: `Rule ${rule.id} already exists.` }, 409);
                }

                found.section.rules.splice(found.index, 1);
                section.rules.push(rule);
                section.rules.sort((a, b) => {
                    const aa = ruleIdParts(a.id)?.number || 0;
                    const bb = ruleIdParts(b.id)?.number || 0;
                    return aa - bb;
                });
                affected = rule;
            }
        }

        const source = rebuildSource(state, parsed);
        const actionLabel = action === "delete" ? "Remove" : action === "update" ? "Update" : "Add";
        await writeRulesSource(
            state,
            source,
            `${actionLabel} rule ${clean(affected?.id, 30) || "District Rulebook"} via Staff Panel`
        );

        return json({
            success: true,
            action,
            rule: affected,
            rulebook,
            message: `${actionLabel} rule completed by ${actor}. The public rulebook will update with the next Pages deployment.`
        });
    } catch (error) {
        console.error("Rules manager POST error:", error);
        return json({ success: false, error: error?.message || "Unable to update the rulebook." }, 500);
    }
}

export function onRequestOptions() {
    return new Response(null, { status: 204 });
}
