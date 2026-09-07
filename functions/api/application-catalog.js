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
            if (char === "*" && next === "/") {
                blockComment = false;
                i++;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = "";
            continue;
        }
        if (char === "/" && next === "/") {
            lineComment = true;
            i++;
            continue;
        }
        if (char === "/" && next === "*") {
            blockComment = true;
            i++;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
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
            if (char === "\n") {
                lineComment = false;
                out += char;
            }
            continue;
        }
        if (blockComment) {
            if (char === "*" && next === "/") {
                blockComment = false;
                i++;
            }
            continue;
        }
        if (quote) {
            out += char;
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = "";
            continue;
        }
        if (char === "/" && next === "/") {
            lineComment = true;
            i++;
            continue;
        }
        if (char === "/" && next === "*") {
            blockComment = true;
            i++;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            out += char;
            continue;
        }
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

function parseMainConfig(source) {
    const declaration = source.indexOf("const APPLICATION_CONFIG");
    if (declaration === -1) throw new Error("APPLICATION_CONFIG was not found.");
    const start = source.indexOf("{", declaration);
    const end = findMatchingBrace(source, start);
    if (start === -1 || end === -1) throw new Error("APPLICATION_CONFIG could not be parsed.");
    return jsObjectToJson(source.slice(start, end + 1));
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

async function fetchRaw(repo, branch, path) {
    const url = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(branch)}/${path}`;
    const response = await fetch(url, { cf: { cacheTtl: 30, cacheEverything: true } });
    if (!response.ok) throw new Error(`Unable to load ${path} (${response.status}).`);
    return response.text();
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
    const words = String(type || "Application")
        .replace(/Application/gi, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    return (words.length >= 2 ? `${words[0][0]}${words[1][0]}` : (words[0] || "AP").slice(0, 2)).toUpperCase();
}

function normaliseApplications(config) {
    return Object.entries(config || {}).map(([application_type, value]) => ({
        application_type,
        title: clean(value?.title, 140) || application_type,
        description: clean(value?.description, 1400),
        group: clean(value?.group, 60) || inferGroup(application_type),
        category: clean(value?.category, 80) || inferGroup(application_type).toUpperCase(),
        icon: clean(value?.icon, 4) || inferIcon(application_type),
        featured: value?.featured === true || /whitelist/i.test(application_type),
        questions: Array.isArray(value?.questions) ? value.questions : []
    }));
}

export async function onRequestGet(context) {
    try {
        const repo = clean(context.env.GITHUB_APPLICATIONS_REPO, 120) || DEFAULT_REPO;
        const branch = clean(context.env.GITHUB_APPLICATIONS_BRANCH, 80) || DEFAULT_BRANCH;
        const [mainSource, businessSource] = await Promise.all([
            fetchRaw(repo, branch, APPLY_PATH),
            fetchRaw(repo, branch, BUSINESS_PATH).catch(() => "")
        ]);

        const config = parseMainConfig(mainSource);
        const business = businessSource ? parseBusinessExtension(businessSource) : null;
        if (business && !config["Business Ownership Application"]) {
            config["Business Ownership Application"] = business;
        }

        return json({ success: true, applications: normaliseApplications(config) });
    } catch (error) {
        console.error("Application catalog error:", error);
        return json({ success: false, error: error?.message || "Unable to load applications." }, 500);
    }
}

export function onRequestOptions() {
    return new Response(null, { status: 204 });
}
