const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";
const DEFAULT_CHANNEL_ID = "1520180829727232010";
const DEFAULT_LOGO_URL = "https://the-district.pages.dev/assets/images/logo.png";
const EMBED_COLOUR = 0x0798ff;

const CHANGE_AREAS = {
    game: {
        label: "Game / Server",
        title: "The District Development Update",
        fields: {
            added: "Added to game",
            removed: "Removed from game",
            changed: "Changed in game",
            fixed: "Fixed in game"
        }
    },
    website: {
        label: "Website",
        title: "The District Website Update",
        fields: {
            added: "Added to website",
            removed: "Removed from website",
            changed: "Changed in website",
            fixed: "Fixed in website"
        }
    },
    discord: {
        label: "Discord",
        title: "The District Discord Update",
        fields: {
            added: "Added to Discord",
            removed: "Removed from Discord",
            changed: "Changed in Discord",
            fixed: "Fixed in Discord"
        }
    },
    backend: {
        label: "Backend / API",
        title: "The District Systems Update",
        fields: {
            added: "Added to backend",
            removed: "Removed from backend",
            changed: "Changed in backend",
            fixed: "Fixed in backend"
        }
    },
    scripts: {
        label: "Scripts / Systems",
        title: "The District Script Update",
        fields: {
            added: "Scripts added",
            removed: "Scripts removed",
            changed: "Scripts changed",
            fixed: "Script fixes"
        }
    },
    phone: {
        label: "Phone System",
        title: "The District Phone Update",
        fields: {
            added: "Added to phone",
            removed: "Removed from phone",
            changed: "Changed in phone",
            fixed: "Fixed in phone"
        }
    },
    police: {
        label: "Police / Emergency Services",
        title: "The District Emergency Services Update",
        fields: {
            added: "Added to emergency services",
            removed: "Removed from emergency services",
            changed: "Changed in emergency services",
            fixed: "Fixed in emergency services"
        }
    },
    vehicles: {
        label: "Vehicles",
        title: "The District Vehicle Update",
        fields: {
            added: "Vehicles added",
            removed: "Vehicles removed",
            changed: "Vehicles changed",
            fixed: "Vehicle fixes"
        }
    },
    maps: {
        label: "Maps / MLOs",
        title: "The District Map Update",
        fields: {
            added: "Added to map",
            removed: "Removed from map",
            changed: "Changed in map",
            fixed: "Fixed in map"
        }
    },
    eup: {
        label: "EUP / Clothing",
        title: "The District EUP Update",
        fields: {
            added: "Added to EUP",
            removed: "Removed from EUP",
            changed: "Changed in EUP",
            fixed: "Fixed in EUP"
        }
    },
    community: {
        label: "Community / Other",
        title: "The District Community Update",
        fields: {
            added: "Added",
            removed: "Removed",
            changed: "Changed",
            fixed: "Fixed"
        }
    }
};

const CHANGE_ICONS = {
    added: "➕",
    removed: "➖",
    changed: "🛠️",
    fixed: "✅"
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
        }
    });
}

function cleanString(value, max = 1000) {
    return String(value ?? "")
        .replace(/\u0000/g, "")
        .trim()
        .slice(0, max);
}

function cleanItems(value, maxItems = 30) {
    const source = Array.isArray(value)
        ? value
        : String(value ?? "").split(/\r?\n/);

    return source
        .map(item => cleanString(item, 280).replace(/^[-•+]\s*/, ""))
        .filter(Boolean)
        .slice(0, maxItems);
}

function listValue(items) {
    const text = items.map(item => `• ${item}`).join("\n");
    return text.slice(0, 1024);
}

function addField(fields, name, items) {
    if (!items.length || fields.length >= 25) return;
    fields.push({
        name,
        value: listValue(items),
        inline: false
    });
}

function resolveChangeArea(value) {
    const key = cleanString(value, 40).toLowerCase();
    return {
        key: CHANGE_AREAS[key] ? key : "game",
        ...(CHANGE_AREAS[key] || CHANGE_AREAS.game)
    };
}

function normaliseAreaEntries(payload = {}) {
    const rawAreas = Array.isArray(payload.areas) ? payload.areas : [];
    const seen = new Set();
    const entries = [];

    rawAreas.forEach(raw => {
        const key = cleanString(raw?.key || raw?.change_area, 40).toLowerCase();
        if (!CHANGE_AREAS[key] || seen.has(key)) return;
        seen.add(key);
        entries.push({
            area: resolveChangeArea(key),
            added: cleanItems(raw?.added),
            removed: cleanItems(raw?.removed),
            changed: cleanItems(raw?.changed),
            fixed: cleanItems(raw?.fixed)
        });
    });

    /* Backwards compatibility with the original single-area payload. */
    if (!entries.length) {
        const area = resolveChangeArea(payload?.change_area);
        entries.push({
            area,
            added: cleanItems(payload?.added),
            removed: cleanItems(payload?.removed),
            changed: cleanItems(payload?.changed),
            fixed: cleanItems(payload?.fixed)
        });
    }

    return entries.slice(0, 11);
}

function areaFieldValue(entry) {
    const sections = [];

    ["added", "removed", "changed", "fixed"].forEach(kind => {
        const items = entry[kind] || [];
        if (!items.length) return;
        sections.push(
            `**${CHANGE_ICONS[kind]} ${entry.area.fields[kind]}**\n` +
            items.map(item => `• ${item}`).join("\n")
        );
    });

    return sections.join("\n\n").slice(0, 1024);
}

function envDiagnostics(env = {}) {
    const names = Object.keys(env)
        .filter(name => /DISCORD|CHANGELOG|CF_PAGES/i.test(name))
        .sort();

    return {
        webhook_binding_present: Boolean(cleanString(env.DISCORD_CHANGELOG_WEBHOOK, 1000)),
        bot_token_present: Boolean(cleanString(env.DISCORD_BOT_TOKEN, 300)),
        changelog_channel_present: Boolean(cleanString(env.CHANGELOG_CHANNEL_ID, 40)),
        matching_binding_names: names,
        pages_branch: cleanString(env.CF_PAGES_BRANCH, 100) || null,
        pages_url: cleanString(env.CF_PAGES_URL, 300) || null
    };
}

async function validateStaff(token) {
    const [permissionsResponse, userResponse] = await Promise.all([
        fetch(`${STAFF_API}/api/staff/permissions`, {
            headers: { Authorization: token }
        }),
        fetch(`${STAFF_API}/api/auth/me`, {
            headers: { Authorization: token }
        })
    ]);

    let permissions = {};
    let userData = {};

    try { permissions = await permissionsResponse.json(); } catch {}
    try { userData = await userResponse.json(); } catch {}

    if (!permissionsResponse.ok || permissions?.success !== true) {
        return null;
    }

    if (!userResponse.ok || userData?.success !== true || userData?.is_staff !== true) {
        return null;
    }

    return {
        permissions,
        user: userData.user || {}
    };
}

function staffName(staff) {
    const user = staff?.user || {};
    return cleanString(
        user.discord_display_name ||
        user.discord_username ||
        user.username ||
        user.union_id ||
        "District Staff",
        80
    );
}

async function sendViaWebhook(webhookUrl, body) {
    const separator = webhookUrl.includes("?") ? "&" : "?";
    const response = await fetch(`${webhookUrl}${separator}wait=true`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            username: "District Core",
            avatar_url: DEFAULT_LOGO_URL,
            allowed_mentions: { parse: [] },
            ...body
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Discord webhook rejected the message (${response.status}): ${detail.slice(0, 180)}`);
    }
}

async function sendViaBot(botToken, channelId, body) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            authorization: `Bot ${botToken}`,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            allowed_mentions: { parse: [] },
            ...body
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Discord API rejected the message (${response.status}): ${detail.slice(0, 180)}`);
    }
}

export async function onRequestPost(context) {
    try {
        const auth = context.request.headers.get("authorization") || "";
        if (!auth.startsWith("Bearer ")) {
            return json({ success: false, error: "Staff authentication is required." }, 401);
        }

        const length = Number(context.request.headers.get("content-length") || 0);
        if (length > 80000) {
            return json({ success: false, error: "Change log payload is too large." }, 413);
        }

        const staff = await validateStaff(auth);
        if (!staff) {
            return json({ success: false, error: "You do not have access to the staff change log publisher." }, 403);
        }

        const minimumLevel = Number(context.env.CHANGELOG_MIN_STAFF_LEVEL || 0);
        const staffLevel = Number(staff.permissions?.staff_level || 0);
        if (minimumLevel > 0 && staffLevel < minimumLevel) {
            return json({ success: false, error: "Your staff level cannot publish development change logs." }, 403);
        }

        let payload;
        try {
            payload = await context.request.json();
        } catch {
            return json({ success: false, error: "Invalid JSON payload." }, 400);
        }

        const areaEntries = normaliseAreaEntries(payload);
        const areaLabels = areaEntries.map(entry => entry.area.label);
        const summary = cleanString(payload?.summary, 900);
        const title = cleanString(payload?.title, 120) || (
            areaEntries.length === 1
                ? areaEntries[0].area.title
                : "The District Multi-System Update"
        );
        const version = cleanString(payload?.version, 40) || "Current Build";
        const environment = cleanString(payload?.environment, 60) || (
            areaEntries.length > 1 ? "Multi-platform" : "Live Server"
        );
        const developerLevel = cleanString(payload?.developer_level, 70) || cleanString(staff.permissions?.staff_role, 70) || "Developer";
        const updateType = cleanString(payload?.update_type, 70) || "Development Update";

        const legacyExternal = cleanItems(payload?.external);
        const knownIssues = cleanItems(payload?.known_issues);

        const hasAreaChanges = areaEntries.some(entry =>
            [entry.added, entry.removed, entry.changed, entry.fixed].some(items => items.length)
        );
        const hasStructuredChanges = hasAreaChanges || legacyExternal.length > 0 || knownIssues.length > 0;

        if (!hasStructuredChanges && !summary) {
            return json({ success: false, error: "Add a summary or at least one change before publishing." }, 400);
        }

        const fields = [];

        areaEntries.forEach(entry => {
            const value = areaFieldValue(entry);
            if (!value || fields.length >= 25) return;
            fields.push({
                name: `📌 ${entry.area.label}`,
                value,
                inline: false
            });
        });

        /* Backwards compatibility for older staff page versions. */
        addField(fields, "🌐 Changed out of game", legacyExternal);
        addField(fields, "⚠️ Known issues / next steps", knownIssues);

        fields.push(
            { name: "Developer Level", value: developerLevel, inline: true },
            { name: "Submitted By", value: staffName(staff), inline: true },
            { name: "Change Areas", value: areaLabels.join(", ").slice(0, 1024), inline: true },
            { name: "Update Type", value: updateType, inline: true },
            { name: "Environment", value: environment, inline: true },
            { name: "Build", value: version, inline: true }
        );

        const now = new Date();
        const pad = value => String(value).padStart(2, "0");
        const reference = `TD-CHG-${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
        const logoUrl = context.env.CHANGELOG_LOGO_URL || DEFAULT_LOGO_URL;
        const footerAreas = areaLabels.join(" • ").slice(0, 900);

        const embed = {
            author: {
                name: "THE DISTRICT // DEVELOPMENT BROADCAST",
                icon_url: logoUrl
            },
            title,
            description: summary || (
                areaEntries.length > 1
                    ? `A new update covering ${areaLabels.join(", ")} has been published for The District.`
                    : `A new ${areaLabels[0].toLowerCase()} update has been published for The District.`
            ),
            color: EMBED_COLOUR,
            thumbnail: { url: logoUrl },
            fields,
            footer: {
                text: `The District Development • ${footerAreas} • ${reference}`,
                icon_url: logoUrl
            },
            timestamp: now.toISOString()
        };

        const messageBody = { embeds: [embed] };
        const webhookUrl = cleanString(context.env.DISCORD_CHANGELOG_WEBHOOK, 1000);
        const botToken = cleanString(context.env.DISCORD_BOT_TOKEN, 300);
        const channelId = cleanString(context.env.CHANGELOG_CHANNEL_ID, 40) || DEFAULT_CHANNEL_ID;

        if (webhookUrl) {
            await sendViaWebhook(webhookUrl, messageBody);
        } else if (botToken) {
            await sendViaBot(botToken, channelId, messageBody);
        } else {
            const diagnostics = envDiagnostics(context.env);
            console.error("Change log Discord binding missing:", diagnostics);
            return json({
                success: false,
                error: "Discord publishing is not configured in this Cloudflare deployment.",
                diagnostics
            }, 503);
        }

        return json({
            success: true,
            channel_id: channelId,
            reference,
            change_areas: areaEntries.map(entry => entry.area.key),
            change_area_labels: areaLabels
        });
    } catch (error) {
        console.error("Change log publish error:", error);
        return json({ success: false, error: error?.message || "Unable to publish the change log." }, 500);
    }
}

export function onRequestGet() {
    return json({ success: false, error: "Method not allowed." }, 405);
}
