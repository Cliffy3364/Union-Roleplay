# Union Roleplay website setup

## 1. GitHub Pages
Upload everything except the `worker` folder to the root of the GitHub Pages repository.

## 2. Discord application
Create an application in the Discord Developer Portal. Add this redirect URL exactly:
`https://YOUR-WORKER.workers.dev/auth/callback`
Create a bot, add it to the Union Discord and allow it to view server members.

## 3. Cloudflare Worker and D1
Create a Worker and a D1 database. Copy the contents of `worker/worker.js` into the Worker, bind the D1 database as `DB`, and execute `worker/schema.sql` against the database. The included `wrangler.toml.example` shows all required public variables.

Add these encrypted Worker secrets:
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `TOKEN_SECRET` (a long random value)
- `APPLICATION_WEBHOOK`
- `SUPPORT_WEBHOOK`

`STAFF_ROLE_IDS` should contain the Discord role IDs allowed into the panel, separated by commas.

## 4. Connect the website
Open `js/config.js` and replace `https://YOUR-WORKER.workers.dev` with the deployed Worker address.

## Discord notifications
Applications produce messages such as “New vehicle developer application”. Support forms produce messages such as “New player report ticket”. The complete answers remain in the D1-backed staff panel. Do not place webhooks, bot tokens or database credentials in GitHub Pages files.
