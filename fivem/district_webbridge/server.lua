local RESOURCE = GetCurrentResourceName()

local function log(message)
    print(('[%s] %s'):format(RESOURCE, message))
end

local function debugLog(message)
    if Config.Debug then
        log(message)
    end
end

local function safeNumber(value)
    local number = tonumber(value)
    return number or 0
end

local function characterName(data)
    local info = data.charinfo or {}
    local first = tostring(info.firstname or '')
    local last = tostring(info.lastname or '')
    local combined = (first .. ' ' .. last):gsub('^%s+', ''):gsub('%s+$', '')

    if combined ~= '' then
        return combined
    end

    return tostring(data.name or data.citizenid or 'Citizen')
end

local function gradeName(job)
    if not job then return '' end

    if type(job.grade) == 'table' then
        return tostring(job.grade.name or job.grade.level or '')
    end

    return tostring(job.grade or '')
end

local function getDiscordId(source)
    for _, identifier in ipairs(GetPlayerIdentifiers(source)) do
        if identifier:sub(1, 8) == 'discord:' then
            return identifier:sub(9)
        end
    end
end

local function createTables()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS district_web_accounts (
            discord_id VARCHAR(32) NOT NULL,
            license VARCHAR(64) NOT NULL,
            last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (discord_id),
            INDEX idx_district_web_license (license)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ]])

    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS district_web_playtime (
            citizenid VARCHAR(50) NOT NULL,
            name VARCHAR(120) NOT NULL DEFAULT '',
            seconds BIGINT UNSIGNED NOT NULL DEFAULT 0,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (citizenid)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ]])

    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS district_web_duty (
            citizenid VARCHAR(50) NOT NULL,
            name VARCHAR(120) NOT NULL DEFAULT '',
            job VARCHAR(50) NOT NULL DEFAULT '',
            seconds BIGINT UNSIGNED NOT NULL DEFAULT 0,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (citizenid)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ]])

    log('Database tables ready.')
end

local function updateAccountMapping(source, data)
    local discordId = getDiscordId(source)
    local license = data and data.license

    if not discordId or discordId == '' or not license or license == '' then
        return
    end

    MySQL.update.await([[
        INSERT INTO district_web_accounts (discord_id, license, last_seen)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            license = VALUES(license),
            last_seen = CURRENT_TIMESTAMP
    ]], { discordId, license })
end

local function trackOnlinePlayers()
    local increment = math.max(10, Config.TrackIntervalSeconds)

    for _, sourceValue in ipairs(GetPlayers()) do
        local source = tonumber(sourceValue)
        local player = source and exports.qbx_core:GetPlayer(source)
        local data = player and player.PlayerData

        if data and data.citizenid then
            updateAccountMapping(source, data)

            local name = characterName(data)

            MySQL.update.await([[
                INSERT INTO district_web_playtime (citizenid, name, seconds)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    seconds = seconds + VALUES(seconds)
            ]], { data.citizenid, name, increment })

            local job = data.job or {}
            if job.onduty == true and Config.EmergencyJobs[tostring(job.name or '')] then
                MySQL.update.await([[
                    INSERT INTO district_web_duty (citizenid, name, job, seconds)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        job = VALUES(job),
                        seconds = seconds + VALUES(seconds)
                ]], { data.citizenid, name, tostring(job.name or ''), increment })
            end
        end
    end
end

local function vehicleDisplayName(modelName, definition)
    if definition then
        local brand = tostring(definition.brand or '')
        local name = tostring(definition.name or definition.model or modelName or 'Vehicle')
        if brand ~= '' and not name:lower():find(brand:lower(), 1, true) then
            return brand .. ' ' .. name
        end
        return name
    end

    return tostring(modelName or 'Vehicle')
end

local function buildSnapshot()
    local playerEntities = exports.qbx_core:SearchPlayers({}) or {}
    local playerVehicles = exports.qbx_vehicles:GetPlayerVehicles() or {}
    local vehiclesByName = exports.qbx_core:GetVehiclesByName() or {}

    local accountRows = MySQL.query.await('SELECT discord_id, license FROM district_web_accounts') or {}
    local playtimeRows = MySQL.query.await('SELECT citizenid, name, seconds FROM district_web_playtime') or {}
    local dutyRows = MySQL.query.await('SELECT citizenid, name, job, seconds FROM district_web_duty') or {}

    local discordByLicense = {}
    for _, row in ipairs(accountRows) do
        if row.license and row.discord_id then
            discordByLicense[tostring(row.license)] = tostring(row.discord_id)
        end
    end

    local vehiclesByCitizen = {}
    for _, vehicle in ipairs(playerVehicles) do
        local citizenid = vehicle.citizenid
        if citizenid then
            vehiclesByCitizen[citizenid] = vehiclesByCitizen[citizenid] or {}
            vehiclesByCitizen[citizenid][#vehiclesByCitizen[citizenid] + 1] = vehicle
        end
    end

    local playtimeByCitizen = {}
    for _, row in ipairs(playtimeRows) do
        playtimeByCitizen[tostring(row.citizenid)] = safeNumber(row.seconds)
    end

    local members = {}
    local moneyBoard = {}
    local vehicleBoard = {}
    local namesByCitizen = {}
    local jobsByCitizen = {}

    for _, player in ipairs(playerEntities) do
        local data = player.PlayerData or player

        if data and data.citizenid then
            local citizenid = tostring(data.citizenid)
            local name = characterName(data)
            local job = data.job or {}
            local money = data.money or {}
            local cash = safeNumber(money.cash)
            local bank = safeNumber(money.bank)
            local totalMoney = cash + bank
            local owned = vehiclesByCitizen[citizenid] or {}
            local websiteVehicles = {}
            local collectionValue = 0

            namesByCitizen[citizenid] = name
            jobsByCitizen[citizenid] = tostring(job.label or job.name or 'Civilian')

            for _, ownedVehicle in ipairs(owned) do
                local modelName = ownedVehicle.modelName or ownedVehicle.vehicle
                local definition = modelName and vehiclesByName[modelName] or nil
                local value = safeNumber(definition and definition.price or 0)
                collectionValue = collectionValue + value

                websiteVehicles[#websiteVehicles + 1] = {
                    id = ownedVehicle.id,
                    name = vehicleDisplayName(modelName, definition),
                    model = modelName,
                    plate = ownedVehicle.props and ownedVehicle.props.plate or '',
                    garage = ownedVehicle.garage or '',
                    state = ownedVehicle.state,
                    value = value
                }
            end

            moneyBoard[#moneyBoard + 1] = {
                name = name,
                citizenid = citizenid,
                money = totalMoney,
                cash = cash,
                bank = bank
            }

            vehicleBoard[#vehicleBoard + 1] = {
                name = name,
                citizenid = citizenid,
                vehicle_count = #websiteVehicles,
                collection_value = collectionValue
            }

            local discordId = discordByLicense[tostring(data.license or '')]
            if discordId then
                members[discordId] = members[discordId] or {
                    discord_id = discordId,
                    characters = {},
                    vehicles = {}
                }

                local member = members[discordId]
                member.characters[#member.characters + 1] = {
                    citizenid = citizenid,
                    name = name,
                    charinfo = {
                        firstname = data.charinfo and data.charinfo.firstname or '',
                        lastname = data.charinfo and data.charinfo.lastname or ''
                    },
                    money = {
                        cash = cash,
                        bank = bank
                    },
                    total_money = totalMoney,
                    job = {
                        name = job.name or '',
                        label = job.label or job.name or 'Civilian',
                        onduty = job.onduty == true,
                        grade = {
                            name = gradeName(job)
                        }
                    },
                    playtime_seconds = playtimeByCitizen[citizenid] or 0,
                    vehicles = websiteVehicles
                }

                for _, vehicle in ipairs(websiteVehicles) do
                    member.vehicles[#member.vehicles + 1] = vehicle
                end
            end
        end
    end

    local playtimeBoard = {}
    for _, row in ipairs(playtimeRows) do
        local citizenid = tostring(row.citizenid)
        local seconds = safeNumber(row.seconds)
        playtimeBoard[#playtimeBoard + 1] = {
            name = namesByCitizen[citizenid] or row.name or citizenid,
            citizenid = citizenid,
            hours = math.floor((seconds / 3600) * 10 + 0.5) / 10,
            seconds = seconds
        }
    end

    local emergencyBoard = {}
    for _, row in ipairs(dutyRows) do
        local citizenid = tostring(row.citizenid)
        local seconds = safeNumber(row.seconds)
        emergencyBoard[#emergencyBoard + 1] = {
            name = namesByCitizen[citizenid] or row.name or citizenid,
            citizenid = citizenid,
            department = jobsByCitizen[citizenid] or row.job or 'Emergency Service',
            job = row.job or '',
            hours = math.floor((seconds / 3600) * 10 + 0.5) / 10,
            seconds = seconds
        }
    end

    table.sort(moneyBoard, function(a, b) return a.money > b.money end)
    table.sort(vehicleBoard, function(a, b) return a.collection_value > b.collection_value end)
    table.sort(playtimeBoard, function(a, b) return a.seconds > b.seconds end)
    table.sort(emergencyBoard, function(a, b) return a.seconds > b.seconds end)

    local function topTen(board)
        local result = {}
        for i = 1, math.min(10, #board) do
            result[i] = board[i]
        end
        return result
    end

    return {
        generated_at = os.time() * 1000,
        server = {
            online = #GetPlayers(),
            max_players = GetConvarInt('sv_maxclients', 230),
            hostname = GetConvar('sv_hostname', 'The District')
        },
        members = members,
        leaderboards = {
            money = topTen(moneyBoard),
            vehicles = topTen(vehicleBoard),
            emergency = topTen(emergencyBoard),
            playtime = topTen(playtimeBoard)
        }
    }
end

local function pushSnapshot()
    if not Config.Secret or Config.Secret == '' then
        log('No district_web_secret is configured. Website sync skipped.')
        return
    end

    local snapshot = buildSnapshot()
    local payload = json.encode(snapshot)

    PerformHttpRequest(Config.Endpoint, function(statusCode, body, _, errorData)
        if statusCode >= 200 and statusCode < 300 then
            debugLog(('Website sync complete (%s bytes).'):format(#payload))
            return
        end

        log(('Website sync failed: HTTP %s%s'):format(
            tostring(statusCode),
            errorData and (' - ' .. tostring(errorData)) or ''
        ))

        if body and body ~= '' then
            debugLog(('Response: %s'):format(body))
        end
    end, 'POST', payload, {
        ['Content-Type'] = 'application/json',
        ['X-District-Bridge'] = Config.Secret
    })
end

CreateThread(function()
    createTables()

    Wait(5000)
    trackOnlinePlayers()
    pushSnapshot()

    while true do
        Wait(math.max(10, Config.TrackIntervalSeconds) * 1000)
        trackOnlinePlayers()
    end
end)

CreateThread(function()
    while true do
        Wait(math.max(30, Config.SyncIntervalSeconds) * 1000)
        pushSnapshot()
    end
end)

RegisterCommand('districtwebsync', function(source)
    if source ~= 0 and not IsPlayerAceAllowed(source, 'district.websync') then
        return
    end

    CreateThread(function()
        trackOnlinePlayers()
        pushSnapshot()
    end)
end, false)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= RESOURCE then return end
    log(('Endpoint: %s'):format(Config.Endpoint))
end)
