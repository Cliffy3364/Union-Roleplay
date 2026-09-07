/* ==========================================================
   THE DISTRICT — PUBLIC WIKI V6
   Once the Wiki API successfully returns the complete library,
   remove the old hard-coded fallback cards so each guide appears
   only once. The static cards remain as an offline fallback if the
   API cannot be reached.
========================================================== */
(function () {
    async function syncAuthoritativeWiki() {
        const grid = document.getElementById("wikiGrid");
        if (!grid) return;

        try {
            const response = await fetch(`/api/wiki?t=${Date.now()}`, {
                headers: { Accept: "application/json" },
                cache: "no-store"
            });
            const data = await response.json();
            if (!response.ok || data?.success !== true || !Array.isArray(data.articles)) return;

            const expected = data.articles.length;
            let attempts = 0;

            const finish = () => {
                const managed = [...grid.querySelectorAll(".v3-managed-wiki-card")];
                if (managed.length < expected && attempts < 35) {
                    attempts++;
                    window.setTimeout(finish, 100);
                    return;
                }

                if (expected > 0 && managed.length >= expected) {
                    grid.querySelectorAll(".wiki-card:not(.v3-managed-wiki-card)").forEach(card => card.remove());
                    document.getElementById("wikiSearch")?.dispatchEvent(new Event("input", { bubbles: true }));
                }
            };

            finish();
        } catch (error) {
            console.warn("Authoritative Wiki sync unavailable; keeping static fallback cards.", error);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => window.setTimeout(syncAuthoritativeWiki, 120), { once: true });
    } else {
        window.setTimeout(syncAuthoritativeWiki, 120);
    }
})();
