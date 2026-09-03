# The District 2026 Rebrand

## Brand direction
The site now uses **Signal Lime** (`#B5FF36`) with graphite black, gunmetal panels and ice-white text. The colour was chosen to match the green lighting already present in The District logo, so the website now feels like part of the same brand instead of a separate purple template.

## Staff Change Log Publisher
The Staff Panel now includes **Management → Change Logs** with:
- update title, build/version, environment, developer level and update type
- Added / Removed / Changed In Game / Changed Out of Game sections
- Known issues / next steps
- a live Discord-style embed preview
- direct publish to Discord channel `1520180829727232010`
- staff authentication checked against the existing District API before sending
- Discord mentions disabled so a pasted `@everyone` cannot accidentally ping the server

## One Cloudflare setting is required for Discord publishing
In the Cloudflare Pages project, add **one** of these as a secret environment variable:

### Recommended: channel webhook
`DISCORD_CHANGELOG_WEBHOOK`

Create a webhook in Discord for channel `1520180829727232010` and paste the webhook URL into that secret.

### Alternative: bot token
`DISCORD_BOT_TOKEN`

If using the bot token, the bot must be in the server and have **View Channel**, **Send Messages** and **Embed Links** permission in channel `1520180829727232010`.

Optional variables:
- `CHANGELOG_CHANNEL_ID` — override the default channel ID.
- `CHANGELOG_LOGO_URL` — override the embed logo URL.
- `CHANGELOG_MIN_STAFF_LEVEL` — numeric minimum staff level for publishing. Leave unset/0 for any authenticated staff member.

After adding the secret, redeploy the Pages project so the Function can use it.
