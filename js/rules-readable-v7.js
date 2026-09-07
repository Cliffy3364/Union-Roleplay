/* ==========================================================
   THE DISTRICT — RULEBOOK V7 READABILITY
   Rules are always visible; no accordion interaction required.
========================================================== */
(function () {
    function expandEverything() {
        document.querySelectorAll("details.rule-item").forEach(rule => {
            if (!rule.open) rule.open = true;
            rule.setAttribute("open", "");
        });
    }

    function lockOpenState() {
        document.getElementById("rulesContent")?.addEventListener("click", event => {
            if (event.target.closest("details.rule-item > summary")) {
                event.preventDefault();
                expandEverything();
            }
        }, true);
    }

    function initialise() {
        expandEverything();
        lockOpenState();

        /* rules.js may render after this dynamic asset executes. */
        let passes = 0;
        const timer = window.setInterval(() => {
            expandEverything();
            passes += 1;
            if (passes >= 12) window.clearInterval(timer);
        }, 140);

        document.getElementById("rulesSearch")?.addEventListener("input", () => {
            window.requestAnimationFrame(expandEverything);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
