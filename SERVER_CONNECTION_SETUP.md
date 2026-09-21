# The District — Live Server Connection

The website is now built to receive real QBOX data from the FiveM server through `district_webbridge`.

## Data path

```
QBOX / qbx_vehicles
        ↓
district_webbridge (FXServer)
        ↓ HTTPS + shared secret
Cloudflare Pages /api/community/sync
        ↓
DISTRICT_GAME_DATA (Cloudflare KV)
        ↓
Authenticated member API
        ↓
Community dashboard
```

The browser never receives MySQL credentials and never connects directly to the game database.

## 1. Cloudflare

Open the Cloudflare Pages project that serves `the-district.pages.dev`.

Create a KV namespace and bind it to the Pages project with this exact variable name:

```
DISTRICT_GAME_DATA
```

Add a Production secret:

```
DISTRICT_BRIDGE_SECRET
```

Use a long random value. Keep it private.

Redeploy the Pages project after adding the binding/secret.

## 2. FiveM

Copy `fivem/district_webbridge` into the server resources folder.

Add to `server.cfg`:

```cfg
set district_web_endpoint "https://the-district.pages.dev/api/community/sync"
set district_web_secret "PASTE_THE_SAME_SECRET_USED_IN_CLOUDFLARE"
ensure district_webbridge
```

Restart the resource/server.

## 3. Link Discord accounts

The bridge automatically records the Discord ID and QBOX license of players while they are online.

A member only needs to join the server once after the bridge is installed for their Discord account to become linked to all QBOX characters on that license.

## 4. Test

From the FXServer console:

```
districtwebsync
```

Expected server console output with debug enabled:

```cfg
set district_web_debug 1
```

The Community page should then show:
- the signed-in member's characters
- cash and bank balance per character
- owned vehicles
- catalogue vehicle values
- Most Money leaderboard
- Most Expensive Car Collection leaderboard
- Most Active Emergency Service Representative leaderboard
- Longest Gameplay leaderboard

## Emergency jobs

The bridge currently recognises these job names:

```
police
ambulance
ems
fire
tdhs
tdfs
```

Edit `fivem/district_webbridge/config.lua` if the actual job names differ.

## Timing

- Character/money/vehicle data is refreshed every 120 seconds by default.
- Playtime is accumulated every 60 seconds.
- Emergency-service activity only counts while a configured emergency job is on duty.
- Playtime and duty leaderboards begin tracking from the moment the bridge is installed.

## Security

Do not commit the bridge secret to GitHub.

The website sync endpoint rejects requests without the matching `X-District-Bridge` secret. Member character data is only returned after the website validates the member's Discord session.
