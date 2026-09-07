/* ==========================================================
   THE DISTRICT — RULEBOOK V7 READABILITY
   Rules are always visible; no accordion interaction required.
========================================================== */
(function () {
    function unlockPageScroll() {
        document.documentElement.style.setProperty("overflow-x", "hidden", "important");
        document.documentElement.style.setProperty("overflow-y", "auto", "important");
        document.documentElement.style.setProperty("height", "auto", "important");

        if (document.body) {
            document.body.style.setProperty("overflow-x", "hidden", "important");
            document.body.style.setProperty("overflow-y", "auto", "important");
            document.body.style.setProperty("height", "auto", "important");
            document.body.style.setProperty("min-height", "100vh", "important");
            document.body.style.setProperty("touch-action", "pan-y", "important");
        }

        const main = document.querySelector("body.rules-page-shell main");
        if (main) {
            main.style.setProperty("height", "auto", "important");
            main.style.setProperty("max-height", "none", "important");
            main.style.setProperty("overflow", "visible", "important");
        }
    }

    function expandEverything() {
        document.querySelectorAll("details.rule-item").forEach(rule => {
            rule.open = true;
            rule.setAttribute("open", "");

            const body = rule.querySelector(":scope > .rule-body");
            if (body) {
                body.style.setProperty("display", "grid", "important");
                body.style.setProperty("visibility", "visible", "important");
                body.style.setProperty("opacity", "1", "important");
                body.style.setProperty("height", "auto", "important");
                body.style.setProperty("max-height", "none", "important");
                body.style.setProperty("overflow", "visible", "important");
            }
        });
    }

    function initialise() {
        unlockPageScroll();
        expandEverything();

        const content = document.getElementById("rulesContent");
        if (content) {
            const observer = new MutationObserver(() => {
                expandEverything();
                unlockPageScroll();
            });
            observer.observe(content, { childList: true, subtree: true });

            window.setTimeout(() => observer.disconnect(), 5000);
        }

        let passes = 0;
        const timer = window.setInterval(() => {
            unlockPageScroll();
            expandEverything();
            passes += 1;
            if (passes >= 24) window.clearInterval(timer);
        }, 125);

        document.getElementById("rulesSearch")?.addEventListener("input", () => {
            window.requestAnimationFrame(() => {
                expandEverything();
                unlockPageScroll();
            });
        });

        window.addEventListener("resize", unlockPageScroll, { passive: true });
        window.addEventListener("pageshow", () => {
            unlockPageScroll();
            expandEverything();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
