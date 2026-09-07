/* ==========================================================
   THE DISTRICT — RULEBOOK V8 STATIC READABILITY
   Removes accordion behaviour completely from the public rulebook.
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
            document.body.style.setProperty("overscroll-behavior-y", "auto", "important");
        }

        const main = document.querySelector("body.rules-page-shell main");
        if (main) {
            main.style.setProperty("height", "auto", "important");
            main.style.setProperty("max-height", "none", "important");
            main.style.setProperty("overflow", "visible", "important");
        }
    }

    function staticiseRule(details) {
        if (!details || details.tagName !== "DETAILS") return false;

        const article = document.createElement("article");
        article.className = `${details.className || "rule-item"} rule-static`;

        Array.from(details.attributes).forEach(attribute => {
            if (attribute.name === "class" || attribute.name === "open") return;
            article.setAttribute(attribute.name, attribute.value);
        });

        if (details.hidden) article.hidden = true;

        const summary = details.querySelector(":scope > summary");
        const body = details.querySelector(":scope > .rule-body");
        const head = document.createElement("div");
        head.className = "rule-head";

        if (summary) {
            Array.from(summary.children).forEach(child => {
                if (child.classList.contains("rule-toggle")) return;
                head.appendChild(child.cloneNode(true));
            });
        }

        article.appendChild(head);
        if (body) article.appendChild(body.cloneNode(true));

        details.replaceWith(article);
        return true;
    }

    function staticiseEverything() {
        let changed = false;

        document.querySelectorAll("details.rule-item").forEach(details => {
            changed = staticiseRule(details) || changed;
        });

        if (changed || document.querySelector("article.rule-item")) {
            document.documentElement.classList.add("district-static-rulebook");
        }
    }

    function initialise() {
        unlockPageScroll();
        staticiseEverything();

        /* rules.js renders at DOMContentLoaded. Poll briefly so this remains
           reliable regardless of which dynamically loaded asset arrives first. */
        let passes = 0;
        const timer = window.setInterval(() => {
            unlockPageScroll();
            staticiseEverything();
            passes += 1;

            if (passes >= 30 || (
                document.querySelector("article.rule-item") &&
                !document.querySelector("details.rule-item")
            )) {
                window.clearInterval(timer);
            }
        }, 100);

        document.getElementById("rulesSearch")?.addEventListener("input", () => {
            window.requestAnimationFrame(() => {
                staticiseEverything();
                unlockPageScroll();
            });
        });

        window.addEventListener("resize", unlockPageScroll, { passive: true });
        window.addEventListener("pageshow", () => {
            unlockPageScroll();
            staticiseEverything();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
