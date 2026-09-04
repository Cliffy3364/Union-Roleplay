# The District Website Setup

## Current visual direction
The current site uses the **District V3** presentation layer: midnight navy, royal blue, porcelain white and restrained brass accents. The V3 files load globally through `js/components.js`, so public pages and the Staff Control Centre share the same visual identity.

## Staff Change Log Publisher
The Staff Panel includes **Management → Change Logs** with:
- dynamic change areas such as Game, Website, Discord, Backend, Vehicles, Maps and EUP
- Added / Removed / Changed / Fixed wording that adapts to the selected area
- optional change sections
- a live Discord preview
- automatic local draft saving so unfinished updates survive navigation, refreshes and browser restarts
- direct Discord publishing
- staff authentication checked before publishing
- Discord mentions disabled to prevent accidental mass pings

### Cloudflare secret required for Change Logs
`DISCORD_CHANGELOG_WEBHOOK`

The webhook is stored only as a Cloudflare Pages Production secret and is read by the Pages Function at runtime.

Optional variables:
- `CHANGELOG_CHANNEL_ID`
- `CHANGELOG_LOGO_URL`
- `CHANGELOG_MIN_STAFF_LEVEL`

---

## Staff Wiki Publisher
The Staff Panel now includes **Management → Wiki Manager**.

Staff can:
- create public Wiki articles
- choose the main Wiki category and optional extra categories
- add search keywords
- write a summary and full article body
- build numbered steps
- add quick facts / locations
- add an important information callout
- optionally add an image URL
- mark an article as featured/wide
- preview the public Wiki card live
- edit or delete previously staff-published Wiki articles
- keep unfinished Wiki articles saved locally as a draft

The public Wiki reads these managed articles through `/api/wiki`, so newly committed Wiki content can appear without manually editing `pages/wiki.html`.

### One Cloudflare secret is required for Wiki publishing
Add this to the **Production** secrets of the Cloudflare Pages project serving `the-district.pages.dev`:

`GITHUB_WIKI_TOKEN`

Use a **fine-grained GitHub Personal Access Token** with access only to the `Cliffy3364/Union-Roleplay` repository and grant **Contents: Read and write** permission. Do not put the token in website JavaScript or commit it to the repository.

Optional variables:
- `GITHUB_WIKI_REPO` — defaults to `Cliffy3364/Union-Roleplay`
- `GITHUB_WIKI_BRANCH` — defaults to `main`
- `WIKI_MIN_STAFF_LEVEL` — numeric minimum staff level; unset/0 allows any authenticated staff member

After adding `GITHUB_WIKI_TOKEN`, redeploy the Cloudflare Pages project once so the Wiki publishing Function can receive it.
