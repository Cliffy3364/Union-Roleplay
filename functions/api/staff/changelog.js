const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";
const DEFAULT_CHANNEL_ID = "1520180829727232010";
const DEFAULT_LOGO_URL = "https://the-district.pages.dev/assets/images/logo.png";
const EMBED_COLOUR = 0xb5ff36;

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
        if (length > 60000) {
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

        const title = cleanString(payload?.title, 120) || "The District Development Update";
        const summary = cleanString(payload?.summary, 900);
        const version = cleanString(payload?.version, 40) || "Current Build";
        const environment = cleanString(payload?.environment, 60) || "Live Server";
        const developerLevel = cleanString(payload?.developer_level, 70) || cleanString(staff.permissions?.staff_role, 70) || "Developer";
        const updateType = cleanString(payload?.update_type, 70) || "Development Update";

        const added = cleanItems(payload?.added);
        const removed = cleanItems(payload?.removed);
        const changed = cleanItems(payload?.changed);
        const external = cleanItems(payload?.external);
        const knownIssues = cleanItems(payload?.known_issues);

        if (![added, removed, changed, external, knownIssues].some(items => items.length)) {
            return json({ success: false, error: "Add at least one change before publishing." }, 400);
        }

        const fields = [];
        addField(fields, "➕ Added to game", added);
        addField(fields, "➖ Removed from game", removed);
        addField(fields, "🛠️ Changed in game", changed);
        addField(fields, "🌐 Changed out of game", external);
        addField(fields, "⚠️ Known issues / next steps", knownIssues);

        fields.push(
            { name: "Developer Level", value: developerLevel, inline: true },
            { name: "Submitted By", value: staffName(staff), inline: true },
            { name: "Update Type", value: updateType, inline: true },
            { name: "Environment", value: environment, inline: true },
            { name: "Build", value: version, inline: true }
        );

        const now = new Date();
        const pad = value => String(value).padStart(2, "0");
        const reference = `TD-CHG-${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
        const logoUrl = context.env.CHANGELOG_LOGO_URL || DEFAULT_LOGO_URL;

        const embed = {
            author: {
                name: "THE DISTRICT // DEVELOPMENT BROADCAST",
                icon_url: logoUrl
            },
            title,
            description: summary || "A new development update has been submitted for The District.",
            color: EMBED_COLOUR,
            thumbnail: { url: logoUrl },
            fields,
            footer: {
                text: `The District Development • ${reference}`,
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
            return json({
                success: false,
                error: "Discord publishing is not configured. Add DISCORD_CHANGELOG_WEBHOOK or DISCORD_BOT_TOKEN to the Cloudflare Pages environment variables."
            }, 503);
        }

        return json({ success: true, channel_id: channelId, reference });
    } catch (error) {
        console.error("Change log publish error:", error);
        return json({ success: false, error: error?.message || "Unable to publish the change log." }, 500);
    }
}

export function onRequestGet() {
    return json({ success: false, error: "Method not allowed." }, 405);
}
