# district_webbridge

Secure QBOX → website bridge for The District.

It uses supported Qbox exports for player and vehicle data, then pushes a filtered website snapshot out from FXServer. The website never connects directly to MySQL.

## Install

1. Copy the `district_webbridge` folder into your FiveM resources folder.
2. Add this to `server.cfg`:

```cfg
set district_web_endpoint "https://the-district.pages.dev/api/community/sync"
set district_web_secret "REPLACE_WITH_A_LONG_RANDOM_SECRET"
ensure district_webbridge
```

3. In Cloudflare Pages, add:
   - a KV binding named `DISTRICT_GAME_DATA`
   - a Production secret named `DISTRICT_BRIDGE_SECRET`
4. `DISTRICT_BRIDGE_SECRET` must contain the exact same secret as `district_web_secret`.
5. Redeploy the Pages project, then restart `district_webbridge`.

## What it sends

Only website-safe profile data is sent:
- Discord ID → game license link
- character name / Citizen ID
- job label / grade
- cash and bank balances
- owned vehicle model, display name, plate, garage, state and catalogue value
- accumulated gameplay time
- accumulated emergency-service duty time
- top 10 money / garage-value / emergency-duty / playtime leaderboards

It does **not** send character birthdates, phone numbers, account numbers, inventory contents or database credentials.

## Tracking

Gameplay and emergency-service duty time start accumulating when this resource is installed. Emergency jobs are configured in `config.lua`.

## Manual sync

From the server console:

```
districtwebsync
```

For in-game use, grant the ACE permission `district.websync`.
