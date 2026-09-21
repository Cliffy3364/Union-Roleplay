Config = {}

-- Keep the secret OUT of this file. Put it in server.cfg:
-- set district_web_secret "a-long-random-secret"
Config.Endpoint = GetConvar('district_web_endpoint', 'https://the-district.pages.dev/api/community/sync')
Config.Secret = GetConvar('district_web_secret', '')

-- Website snapshot interval.
Config.SyncIntervalSeconds = GetConvarInt('district_web_sync_interval', 120)

-- Online/playtime tracking interval.
Config.TrackIntervalSeconds = GetConvarInt('district_web_track_interval', 60)

-- Add/remove job names here to match your server.
Config.EmergencyJobs = {
    police = true,
    ambulance = true,
    ems = true,
    fire = true,
    tdhs = true,
    tdfs = true
}

Config.Debug = GetConvarInt('district_web_debug', 0) == 1
