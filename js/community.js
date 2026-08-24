const COMMUNITY_API = "https://the-district-api.danielclifford2808.workers.dev";
const SERVER_ADDRESS = "185.223.29.112:30120";

function setServerDisplay(data) {
    const state = document.getElementById("serverState");
    const stateText = state?.querySelector("span");
    const players = document.getElementById("serverPlayers");
    const maxPlayers = document.getElementById("serverMaxPlayers");
    const hostname = document.getElementById("serverHostname");
    const bar = document.getElementById("serverCapacityBar");
    const statStatus = document.getElementById("statServerStatus");
    const statPlayers = document.getElementById("statPlayers");

    const online = data?.online === true;
    const playerCount = Number(data?.players ?? data?.player_count ?? 0);
    const max = Number(data?.max_players ?? data?.maxPlayers ?? 0);

    if (state) state.className = `server-state ${online ? "online" : "offline"}`;
    if (stateText) stateText.textContent = online ? "Online" : "Offline";
    if (players) players.textContent = online ? playerCount : "0";
    if (maxPlayers) maxPlayers.textContent = max || "--";
    if (hostname && data?.hostname) hostname.textContent = data.hostname;
    if (statStatus) statStatus.textContent = online ? "Online" : "Offline";
    if (statPlayers) statPlayers.textContent = online ? String(playerCount) : "0";

    if (bar) {
        const percentage = max > 0 ? Math.min(100, (playerCount / max) * 100) : 0;
        bar.style.width = `${percentage}%`;
    }
}

async function loadServerStatus() {
    try {
        const response = await fetch(`${COMMUNITY_API}/api/community/server`, {
            headers: { Accept: "application/json" },
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok || data?.success === false) {
            throw new Error(data?.error || "Unable to read server status.");
        }

        setServerDisplay(data);
    } catch (error) {
        console.warn("Community server status unavailable:", error);
        setServerDisplay({ online: false, players: 0 });
    }
}

function renderLeaderboard(containerId, entries, valueFormatter) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!Array.isArray(entries) || !entries.length) {
        container.innerHTML = `<div class="leaderboard-empty">Leaderboard data will appear here once connected.</div>`;
        return;
    }

    container.innerHTML = entries.slice(0, 10).map((entry, index) => `
        <div class="leaderboard-row">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${escapeCommunityHtml(entry.name || entry.character_name || "Citizen")}</span>
            <span class="leaderboard-value">${escapeCommunityHtml(valueFormatter(entry))}</span>
        </div>
    `).join("");
}

function escapeCommunityHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadLeaderboards() {
    try {
        const response = await fetch(`${COMMUNITY_API}/api/community/leaderboards`, {
            headers: { Accept: "application/json" },
            cache: "no-store"
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data?.success) return;

        renderLeaderboard("playtimeLeaderboard", data.playtime || [], entry =>
            entry.formatted || `${entry.hours ?? entry.playtime ?? 0} hrs`
        );

        renderLeaderboard("moneyLeaderboard", data.money || [], entry => {
            if (entry.formatted) return entry.formatted;
            const amount = Number(entry.money ?? entry.net_worth ?? 0);
            return new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
                maximumFractionDigits: 0
            }).format(amount);
        });
    } catch (error) {
        console.warn("Community leaderboards unavailable:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadServerStatus();
    loadLeaderboards();

    // Keep the live player/server display reasonably fresh while this page is open.
    setInterval(loadServerStatus, 30000);
});
