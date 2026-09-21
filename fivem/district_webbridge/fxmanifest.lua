fx_version 'cerulean'
game 'gta5'

name 'district_webbridge'
author 'The District'
description 'Secure QBOX data bridge for The District member website'
version '1.0.0'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'config.lua',
    'server.lua'
}

dependencies {
    'oxmysql',
    'qbx_core',
    'qbx_vehicles'
}
