import {
    ensureCreatorsTable,
    extractHandle,
    getCreatorsWithStatus,
    json,
    normalizeChannelUrl,
    normalizePlatform
} from "../../../src/creator-helpers.js";

const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";

async function requireCreatorManagement(request) {
    const authorization = request.headers.get("Authorization") || "";

    if (!authorization.startsWith("Bearer ")) {
        return {
            error: json({ success: false, error: "Not logged in." }, 401)
        };
    }

    let response;

    try {
        response = await fetch(`${STAFF_API}/api/staff/permissions`, {
            headers: { Authorization: authorization }
        });
    } catch {
        return {
            error: json({ success: false, error: "Unable to verify staff permissions." }, 502)
        };
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok || !data?.success) {
        return {
            error: json({ success: false, error: data?.error || "Staff access denied." }, response.status || 403)
        };
    }

    const permissions = data.permissions || {};
    const staffLevel = Number(data.staff_level || 0);
    const allowed =
        permissions.member_management === true ||
        permissions.application_availability === true ||
        staffLevel >= 500;

    if (!allowed) {
        return {
            error: json({ success: false, error: "Creator management is restricted to management staff." }, 403)
        };
    }

    return { staff: data };
}

export async function onRequestGet(context) {
    const access = await requireCreatorManagement(context.request);
    if (access.error) return access.error;

    try {
        const url = new URL(context.request.url);
        const forceRefresh = url.searchParams.get("refresh") === "1";
        const creators = await getCreatorsWithStatus(context.env, forceRefresh);

        return json({
            success: true,
            creators
        });
    } catch (error) {
        return json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }
}

export async function onRequestPost(context) {
    const access = await requireCreatorManagement(context.request);
    if (access.error) return access.error;

    try {
        await ensureCreatorsTable(context.env);

        const body = await context.request.json();
        const name = String(body?.name || "").trim();
        const platform = normalizePlatform(body?.platform);

        if (name.length < 2 || name.length > 60) {
            return json({
                success: false,
                error: "Enter a creator name between 2 and 60 characters."
            }, 400);
        }

        if (!platform) {
            return json({
                success: false,
                error: "Choose Twitch, YouTube, Kick or TikTok."
            }, 400);
        }

        const channelUrl = normalizeChannelUrl(platform, body?.channel_url || body?.channelUrl);
        const handle = extractHandle(platform, channelUrl);
        const now = Date.now();
        const createdBy =
            access.staff?.user?.discord_id ||
            access.staff?.discord_id ||
            access.staff?.staff_discord_id ||
            "staff";

        try {
            const result = await context.env.DB.prepare(`
                INSERT INTO creators (
                    name,
                    platform,
                    channel_url,
                    handle,
                    active,
                    created_by,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, 1, ?, ?, ?)
            `)
                .bind(name, platform, channelUrl, handle, String(createdBy), now, now)
                .run();

            return json({
                success: true,
                message: "Streamer added.",
                id: result.meta?.last_row_id || null
            }, 201);
        } catch (error) {
            const message = String(error?.message || error || "");

            if (/unique|constraint/i.test(message)) {
                return json({
                    success: false,
                    error: "That creator account is already on the roster."
                }, 409);
            }

            throw error;
        }
    } catch (error) {
        return json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }
}

export async function onRequestDelete(context) {
    const access = await requireCreatorManagement(context.request);
    if (access.error) return access.error;

    try {
        await ensureCreatorsTable(context.env);

        const url = new URL(context.request.url);
        const id = Number(url.searchParams.get("id"));

        if (!Number.isInteger(id) || id <= 0) {
            return json({ success: false, error: "Invalid creator ID." }, 400);
        }

        const existing = await context.env.DB.prepare(`
            SELECT id, name
            FROM creators
            WHERE id = ?
            LIMIT 1
        `).bind(id).first();

        if (!existing) {
            return json({ success: false, error: "Creator not found." }, 404);
        }

        await context.env.DB.prepare(`
            DELETE FROM creators
            WHERE id = ?
        `).bind(id).run();

        return json({
            success: true,
            message: `${existing.name} was removed from the creator roster.`
        });
    } catch (error) {
        return json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }
}
