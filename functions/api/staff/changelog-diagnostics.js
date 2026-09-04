function json(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
        }
    });
}

function present(value) {
    return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function onRequestGet(context) {
    const env = context.env || {};
    const matchingNames = Object.keys(env)
        .filter(name => /DISCORD|CHANGELOG|CF_PAGES/i.test(name))
        .sort();

    return json({
        ok: true,
        webhook_binding_present: present(env.DISCORD_CHANGELOG_WEBHOOK),
        bot_token_present: present(env.DISCORD_BOT_TOKEN),
        changelog_channel_present: present(env.CHANGELOG_CHANNEL_ID),
        matching_binding_names: matchingNames,
        pages_branch: env.CF_PAGES_BRANCH || null,
        pages_url: env.CF_PAGES_URL || null
    });
}
