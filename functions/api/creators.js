import {
    getCreatorsWithStatus,
    json
} from "../../src/creator-helpers.js";

export async function onRequestGet(context) {
    try {
        const creators = await getCreatorsWithStatus(context.env, false);

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
