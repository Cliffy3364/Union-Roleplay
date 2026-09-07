/* ==========================================================
   THE DISTRICT — RULEBOOK V5 SIMPLE BEHAVIOUR
   Keeps every rule readable without opening accordions.
========================================================== */
(function () {
    function openAllRules() {
        document.querySelectorAll("details.rule-item").forEach(rule => {
            rule.open = true;
            rule.querySelector("summary")?.addEventListener("click", event => {
                event.preventDefault();
                rule.open = true;
            });
        });
    }

    function initialise() {
        const content = document.getElementById("rulesContent");
        if (!content) return;

        openAllRules();

        const observer = new MutationObserver(() => openAllRules());
        observer.observe(content, { childList: true, subtree: true });

        const search = document.getElementById("rulesSearch");
        search?.addEventListener("input", () => window.setTimeout(openAllRules, 0));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => window.setTimeout(initialise, 80), { once: true });
    } else {
        window.setTimeout(initialise, 80);
    }
})();
