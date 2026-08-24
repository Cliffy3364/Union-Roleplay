const STATUS_TTL_MS = 60 * 1000;

export function json(data, status = 200) {
    return Response.json(data, {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

export async function ensureCreatorsTable(env) {
    if (!env?.DB) {
        throw new Error("The DB binding is missing from this Pages project.");
    }

    await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS creators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            channel_url TEXT NOT NULL,
            handle TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            created_by TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            last_live INTEGER NOT NULL DEFAULT 0,
            last_checked_at INTEGER,
            last_live_data TEXT
        )
    `).run();

    const additions = [
        ["handle", "TEXT"],
        ["active", "INTEGER NOT NULL DEFAULT 1"],
        ["created_by", "TEXT"],
        ["updated_at", "INTEGER"],
        ["last_live", "INTEGER NOT NULL DEFAULT 0"],
        ["last_checked_at", "INTEGER"],
        ["last_live_data", "TEXT"]
    ];

    for (const [column, definition] of additions) {
        try {
            await env.DB.prepare(
                `ALTER TABLE creators ADD COLUMN ${column} ${definition}`
            ).run();
        } catch {
            // Column already exists.
        }
    }

    await env.DB.prepare(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_channel_url
        ON creators(channel_url)
    `).run();
}

export function normalizePlatform(value) {
    const platform = String(value || "").trim().toLowerCase();

    if (platform === "twitch") return "Twitch";
    if (platform === "youtube" || platform === "you tube") return "YouTube";
    if (platform === "kick") return "Kick";
    if (platform === "tiktok" || platform === "tik tok") return "TikTok";

    return null;
}

function cleanHostname(hostname) {
    return String(hostname || "").toLowerCase().replace(/^www\./, "");
}

function allowedHost(platform, hostname) {
    const host = cleanHostname(hostname);

    if (platform === "Twitch") {
        return host === "twitch.tv" || host === "m.twitch.tv";
    }

    if (platform === "YouTube") {
        return host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be";
    }

    if (platform === "Kick") {
        return host === "kick.com";
    }

    if (platform === "TikTok") {
        return host === "tiktok.com" || host === "m.tiktok.com";
    }

    return false;
}

export function normalizeChannelUrl(platform, rawUrl) {
    const normalizedPlatform = normalizePlatform(platform);

    if (!normalizedPlatform) {
        throw new Error("Choose Twitch, YouTube, Kick or TikTok.");
    }

    let value = String(rawUrl || "").trim();

    if (!value) {
        throw new Error("Enter the creator's account link.");
    }

    if (!/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
    }

    let parsed;

    try {
        parsed = new URL(value);
    } catch {
        throw new Error("Enter a valid account link.");
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("The account link must use http or https.");
    }

    if (!allowedHost(normalizedPlatform, parsed.hostname)) {
        throw new Error(`That link is not a valid ${normalizedPlatform} account link.`);
    }

    parsed.protocol = "https:";
    parsed.hash = "";

    return parsed.toString().replace(/\/$/, "");
}

export function extractHandle(platform, channelUrl) {
    const normalizedPlatform = normalizePlatform(platform);

    try {
        const url = new URL(channelUrl);
        const parts = url.pathname.split("/").filter(Boolean);

        if (!parts.length) return "";

        if (normalizedPlatform === "YouTube") {
            const last = parts[parts.length - 1];
            return decodeURIComponent(last).replace(/^@/, "");
        }

        return decodeURIComponent(parts[0]).replace(/^@/, "");
    } catch {
        return "";
    }
}

function decodeHtml(value) {
    return String(value || "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function metaContent(html, property) {
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
        new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["']`, "i")
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) return decodeHtml(match[1]);
    }

    return "";
}

function parseViewerCount(html) {
    const patterns = [
        /([\d,.]+)\s+viewers?/i,
        /"viewersCount"\s*:\s*"?([\d,]+)"?/i,
        /"concurrentViewers"\s*:\s*"?([\d,]+)"?/i
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (!match?.[1]) continue;

        const number = Number(String(match[1]).replace(/,/g, ""));
        if (Number.isFinite(number)) return number;
    }

    return null;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 9000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            redirect: "follow",
            ...options,
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",
                "Accept-Language": "en-GB,en;q=0.9",
                ...(options.headers || {})
            }
        });
    } finally {
        clearTimeout(timer);
    }
}

function baseStatus(creator) {
    return {
        id: Number(creator.id),
        name: creator.name,
        platform: creator.platform,
        channelUrl: creator.channel_url,
        handle: creator.handle || extractHandle(creator.platform, creator.channel_url),
        live: false,
        viewers: null,
        statusLine: "",
        thumbnail: "",
        avatar: "",
        tags: [creator.platform, "THE DISTRICT"]
    };
}

async function checkKick(creator) {
    const status = baseStatus(creator);
    const slug = status.handle;

    if (!slug) return status;

    const response = await fetchWithTimeout(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`);
    if (!response.ok) return status;

    const data = await response.json();
    const live = data?.livestream || data?.live_stream || null;

    status.live = Boolean(live && (live.is_live !== false));
    status.viewers = Number(live?.viewer_count ?? live?.viewers ?? 0) || null;
    status.statusLine = String(live?.session_title || live?.title || "Live on Kick");
    status.thumbnail = String(live?.thumbnail?.url || live?.thumbnail || "");
    status.avatar = String(data?.user?.profile_pic || data?.user?.profile_picture || "");

    return status;
}

async function checkTwitch(creator) {
    const status = baseStatus(creator);
    const slug = status.handle;

    if (!slug) return status;

    const response = await fetchWithTimeout(`https://www.twitch.tv/${encodeURIComponent(slug)}`);
    if (!response.ok) return status;

    const html = await response.text();

    status.live =
        /"isLiveBroadcast"\s*:\s*true/i.test(html) ||
        /"isLive"\s*:\s*true/i.test(html) ||
        /"broadcastType"\s*:\s*"live"/i.test(html);

    if (status.live) {
        status.viewers = parseViewerCount(html);
        status.statusLine = metaContent(html, "og:description") || "Live on Twitch";
        status.thumbnail = metaContent(html, "og:image");
    }

    return status;
}

async function checkYouTube(creator) {
    const status = baseStatus(creator);
    let liveUrl = String(creator.channel_url || "").replace(/\/$/, "");

    if (!/\/live(?:$|[?#])/i.test(liveUrl)) {
        liveUrl += "/live";
    }

    const response = await fetchWithTimeout(liveUrl);
    if (!response.ok) return status;

    const html = await response.text();

    status.live =
        /"isLiveNow"\s*:\s*true/i.test(html) ||
        /"isLive"\s*:\s*true/i.test(html) && /"isLiveContent"\s*:\s*true/i.test(html);

    if (status.live) {
        status.viewers = parseViewerCount(html);
        status.statusLine = metaContent(html, "og:title") || "Live on YouTube";
        status.thumbnail = metaContent(html, "og:image");
        status.channelUrl = response.url || creator.channel_url;
    }

    return status;
}

async function checkTikTok(creator) {
    const status = baseStatus(creator);
    const handle = status.handle;

    if (!handle) return status;

    const response = await fetchWithTimeout(`https://www.tiktok.com/@${encodeURIComponent(handle)}/live`);
    if (!response.ok) return status;

    const html = await response.text();

    status.live =
        /"status"\s*:\s*2/i.test(html) &&
        (/"roomId"\s*:/i.test(html) || /"room_id"\s*:/i.test(html));

    if (status.live) {
        status.viewers = parseViewerCount(html);
        status.statusLine = metaContent(html, "og:title") || "Live on TikTok";
        status.thumbnail = metaContent(html, "og:image");
    }

    return status;
}

export async function detectCreatorStatus(creator) {
    try {
        if (creator.platform === "Kick") return await checkKick(creator);
        if (creator.platform === "Twitch") return await checkTwitch(creator);
        if (creator.platform === "YouTube") return await checkYouTube(creator);
        if (creator.platform === "TikTok") return await checkTikTok(creator);
    } catch (error) {
        console.warn(`Creator live check failed for ${creator.name}:`, error);
    }

    return baseStatus(creator);
}

function parseCachedStatus(creator) {
    try {
        const data = JSON.parse(creator.last_live_data || "{}");
        if (!data || typeof data !== "object") return null;
        return {
            ...baseStatus(creator),
            ...data,
            id: Number(creator.id),
            name: creator.name,
            platform: creator.platform,
            channelUrl: data.channelUrl || creator.channel_url,
            handle: creator.handle || data.handle || extractHandle(creator.platform, creator.channel_url)
        };
    } catch {
        return null;
    }
}

export async function getCreatorsWithStatus(env, forceRefresh = false) {
    await ensureCreatorsTable(env);

    const result = await env.DB.prepare(`
        SELECT *
        FROM creators
        WHERE active = 1
        ORDER BY name COLLATE NOCASE ASC, id ASC
    `).all();

    const creators = result.results || [];
    const now = Date.now();

    return Promise.all(
        creators.map(async creator => {
            const cached = parseCachedStatus(creator);
            const recent = Number(creator.last_checked_at || 0) > now - STATUS_TTL_MS;

            if (!forceRefresh && recent && cached) {
                return {
                    ...cached,
                    checkedAt: Number(creator.last_checked_at || now)
                };
            }

            const status = await detectCreatorStatus(creator);
            const checkedAt = Date.now();

            try {
                await env.DB.prepare(`
                    UPDATE creators
                    SET last_live = ?, last_checked_at = ?, last_live_data = ?, updated_at = ?
                    WHERE id = ?
                `)
                    .bind(
                        status.live ? 1 : 0,
                        checkedAt,
                        JSON.stringify(status),
                        Number(creator.updated_at || checkedAt),
                        creator.id
                    )
                    .run();
            } catch (error) {
                console.warn("Unable to cache creator status:", error);
            }

            return {
                ...status,
                checkedAt
            };
        })
    );
}
