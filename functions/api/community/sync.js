import { json } from "../../_lib/member-auth.js";

const SNAPSHOT_KEY = "district:game:snapshot";

export async function onRequestPost(context) {
    const env = context.env;
    const expected = String(env.DISTRICT_BRIDGE_SECRET || "");
    const supplied = String(context.request.headers.get("X-District-Bridge") || "");

    if (!expected) {
        return json({ success: false, error: "DISTRICT_BRIDGE_SECRET is not configured." }, 503);
    }

    if (!supplied || supplied !== expected) {
        return json({ success: false, error: "Invalid bridge secret." }, 401);
    }

    if (!env.DISTRICT_GAME_DATA) {
        return json({ success: false, error: "DISTRICT_GAME_DATA KV binding is not configured." }, 503);
    }

    let payload;
    try {
        payload = await context.request.json();
    } catch {
        return json({ success: false, error: "Invalid JSON payload." }, 400);
    }

    if (!payload || typeof payload !== "object") {
        return json({ success: false, error: "Snapshot payload is required." }, 400);
    }

    const normalized = {
        generated_at: Number(payload.generated_at || Date.now()),
        server: payload.server && typeof payload.server === "object" ? payload.server : {},
        members: payload.members && typeof payload.members === "object" ? payload.members : {},
        leaderboards: payload.leaderboards && typeof payload.leaderboards === "object" ? payload.leaderboards : {}
    };

    const encoded = JSON.stringify(normalized);
    if (encoded.length > 20 * 1024 * 1024) {
        return json({ success: false, error: "Snapshot is too large." }, 413);
    }

    await env.DISTRICT_GAME_DATA.put(SNAPSHOT_KEY, encoded);

    return json({
        success: true,
        received_at: Date.now(),
        member_count: Object.keys(normalized.members).length
    });
}

export async function onRequestGet() {
    return json({ success: false, error: "Method not allowed." }, 405);
}