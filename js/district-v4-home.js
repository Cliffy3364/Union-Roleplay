/* ==========================================================
   THE DISTRICT — V4 HOMEPAGE INTERACTIONS
========================================================== */
(function () {
    const API = "https://the-district-api.danielclifford2808.workers.dev";
    const RELEASE = new Date("2026-09-18T18:00:00+01:00");

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function updateServerCard(data) {
        const online = data?.online === true;
        const players = Number(data?.players ?? data?.player_count ?? 0);
        const max = Number(data?.max_players ?? data?.maxPlayers ?? 230) || 230;

        setText("v4Players", online ? players : 0);
        setText("v4MaxPlayers", max);
        setText("v4OnlineLabel", online ? "ONLINE" : "OFFLINE");

        const live = document.getElementById("v4StatusLive");
        if (live) live.classList.toggle("offline", !online);

        const pct = max > 0 ? Math.max(3, Math.min(100, (players / max) * 100)) : 8;
        document.querySelectorAll(".v4-player-bars span").forEach((bar, index) => {
            const modifier = [1, .82, .64, .48][index] ?? .4;
            bar.style.setProperty("--bar", `${Math.max(8, pct * modifier)}%`);
        });
    }

    async function loadServerStatus() {
        try {
            const response = await fetch(`${API}/api/community/server`, {
                headers: { Accept: "application/json" },
                cache: "no-store"
            });
            const data = await response.json();
            if (!response.ok || data?.success === false) throw new Error(data?.error || "Server unavailable");
            updateServerCard(data);
        } catch (error) {
            console.warn("V4 server status unavailable:", error);
            updateServerCard({ online: false, players: 0, max_players: 230 });
        }
    }

    function pad(value) {
        return String(Math.max(0, value)).padStart(2, "0");
    }

    function updateReleaseLine() {
        const line = document.getElementById("v4ReleaseLine");
        if (!line) return;

        const delta = RELEASE.getTime() - Date.now();
        if (delta <= 0) {
            line.textContent = "THE DISTRICT IS LIVE";
            return;
        }

        const total = Math.floor(delta / 1000);
        const days = Math.floor(total / 86400);
        const hours = Math.floor((total % 86400) / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        line.textContent = `${pad(days)}D ${pad(hours)}H ${pad(minutes)}M UNTIL RELEASE`;
    }

    function retireCommunityLinks() {
        document.querySelectorAll('a[href*="community.html"]').forEach(link => {
            const label = link.textContent.replace(/\s+/g, " ").trim().toLowerCase();

            if (label === "community") {
                link.href = "https://discord.gg/qyUKU9HtyN";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "Discord";
                return;
            }

            if (label.includes("see community")) {
                link.href = "https://discord.gg/qyUKU9HtyN";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "Join Discord";
                return;
            }

            if (label.includes("explore the city")) {
                link.href = "pages/wiki.html#wiki-locations";
                return;
            }

            link.href = "pages/wiki.html";
        });
    }

    function setupReveal() {
        if (!("IntersectionObserver" in window)) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

        const nodes = document.querySelectorAll(
            ".v4-feature-card, .v4-info-card, .v4-event-card, .v4-city-banner, .v4-discord-panel, .v4-wiki-panel"
        );

        nodes.forEach(node => {
            node.style.opacity = "0";
            node.style.transform = "translateY(18px)";
            node.style.transition = "opacity .45s ease, transform .45s ease";
        });

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            });
        }, { threshold: .08, rootMargin: "0px 0px -35px 0px" });

        nodes.forEach(node => observer.observe(node));
    }

    function setupHeroParallax() {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
        const hero = document.querySelector(".v4-hero");
        if (!hero) return;

        window.addEventListener("scroll", () => {
            if (window.scrollY > 900) return;
            const offset = Math.min(30, window.scrollY * .035);
            hero.style.backgroundPosition = `center calc(46% + ${offset}px)`;
        }, { passive: true });
    }

    function initialise() {
        retireCommunityLinks();
        loadServerStatus();
        updateReleaseLine();
        setupReveal();
        setupHeroParallax();
        window.setInterval(loadServerStatus, 30000);
        window.setInterval(updateReleaseLine, 30000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
