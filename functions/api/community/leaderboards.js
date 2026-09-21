import { json, requireDistrictUser } from "../../_lib/member-auth.js";

const SNAPSHOT_KEY = "district:game:snapshot";

export async function onRequestGet(context) {
    const auth = await requireDistrictUser(context.request);
    if (!auth.ok) return json({ success: false, error: auth.error }, auth.status);

    if (!context.env.DISTRICT_GAME_DATA) {
        return json({ success: false, error: "Game data connection is not configured." }, 503);
    }

    const snapshot = await context.env.DISTRICT_GAME_DATA.get(SNAPSHOT_KEY, "json");
    if (!snapshot) {
        return json({ success: false, error: "The FiveM server has not synced leaderboard data yet." }, 503);
    }

    const boards = snapshot.leaderboards || {};

    return json({
        success: true,
        generated_at: snapshot.generated_at || null,
        money: Array.isArray(boards.money) ? boards.money : [],
        vehicles: Array.isArray(boards.vehicles) ? boards.vehicles : [],
        emergency: Array.isArray(boards.emergency) ? boards.emergency : [],
        playtime: Array.isArray(boards.playtime) ? boards.playtime : []
    });
}