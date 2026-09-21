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
        return json({ success: false, error: "The FiveM server has not synced any member data yet." }, 503);
    }

    const discordId = String(auth.user.discord_id || auth.user.id || "");
    const member = snapshot.members?.[discordId];

    return json({
        success: true,
        generated_at: snapshot.generated_at || null,
        profile: member || { discord_id: discordId, characters: [], vehicles: [] }
    });
}