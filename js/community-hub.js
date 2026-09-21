/* The District — community hub interactions */
(function () {
    const API = "https://the-district-api.danielclifford2808.workers.dev";

    function text(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    async function loadServerStatus() {
        const targets = document.querySelectorAll("[data-server-status]");
        if (!targets.length) return;

        try {
            const response = await fetch(`${API}/api/community/server`, {
                headers: { Accept: "application/json" },
                cache: "no-store"
            });
            const data = await response.json();
            if (!response.ok || data?.success === false) throw new Error(data?.error || "Unavailable");

            const online = data?.online === true;
            const players = Number(data?.players ?? data?.player_count ?? 0);
            const max = Number(data?.max_players ?? data?.maxPlayers ?? 230) || 230;

            text("hubPlayers", online ? players : 0);
            text("hubMaxPlayers", max);
            text("hubServerLabel", online ? "ONLINE" : "OFFLINE");
            text("communityPlayers", online ? players : 0);
            text("communityMaxPlayers", max);

            targets.forEach(el => {
                el.dataset.state = online ? "online" : "offline";
                el.classList.toggle("offline", !online);
            });

            const fill = document.getElementById("hubCapacityFill");
            if (fill) fill.style.width = `${Math.max(4, Math.min(100, (players / max) * 100))}%`;
        } catch (error) {
            console.warn("Server status unavailable:", error);
            text("hubPlayers", "0");
            text("hubServerLabel", "OFFLINE");
            text("communityPlayers", "0");
            targets.forEach(el => {
                el.dataset.state = "offline";
                el.classList.add("offline");
            });
        }
    }

    function setupReveal() {
        if (!("IntersectionObserver" in window)) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

        const nodes = document.querySelectorAll("[data-reveal]");
        nodes.forEach((node, index) => {
            node.style.opacity = "0";
            node.style.transform = "translateY(18px)";
            node.style.transition = `opacity .5s ease ${Math.min(index % 4, 3) * 60}ms, transform .5s ease ${Math.min(index % 4, 3) * 60}ms`;
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

    document.addEventListener("DOMContentLoaded", () => {
        loadServerStatus();
        setupReveal();
        window.setInterval(loadServerStatus, 30000);
    });
})();

/* Gameplay slot gracefully falls back until the server's own MP4 is added. */
document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("districtGameplayVideo");
    const fallback = document.getElementById("districtGameplayFallback");
    if (!video || !fallback) return;

    const showFallback = () => {
        video.hidden = true;
        fallback.hidden = false;
    };

    video.addEventListener("error", showFallback);
    const source = video.querySelector("source");
    if (source) source.addEventListener("error", showFallback);
});
