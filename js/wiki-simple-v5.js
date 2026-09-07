/* ==========================================================
   THE DISTRICT — WIKI V5 SIMPLE NAVIGATION
========================================================== */
(function () {
    const GROUPS = [
        { key: "start", label: "Start Here", icon: "ST" },
        { key: "locations", label: "Where Things Are", icon: "MP" },
        { key: "systems", label: "City Systems", icon: "SY" },
        { key: "services", label: "Public Services", icon: "PS" },
        { key: "roleplay", label: "Roleplay Guides", icon: "RP" },
        { key: "support", label: "Support", icon: "SP" }
    ];

    let cards = [];
    let activeId = "welcome";

    function titleFor(card) {
        return card?.querySelector("h3")?.textContent?.trim() || "District Guide";
    }

    function firstCategory(card) {
        const categories = String(card?.dataset?.category || "start").split(/\s+/).filter(Boolean);
        return GROUPS.find(group => categories.includes(group.key))?.key || "start";
    }

    function setHeader(title, countText) {
        const heading = document.getElementById("wikiResultsTitle");
        const count = document.getElementById("wikiResultCount");
        if (heading) heading.textContent = title;
        if (count) count.textContent = countText;
    }

    function showWelcome(updateHash = true) {
        activeId = "welcome";
        cards.forEach(card => card.classList.remove("wiki-simple-active"));
        document.getElementById("wikiSimpleWelcome")?.removeAttribute("hidden");
        document.querySelectorAll(".wiki-simple-link").forEach(link => {
            link.classList.toggle("active", link.dataset.articleId === "welcome");
        });
        const mobile = document.getElementById("wikiSimpleMobileSelect");
        if (mobile) mobile.value = "welcome";
        setHeader("Welcome", `${cards.length} guides available`);
        if (updateHash && history.replaceState) history.replaceState(null, "", `${location.pathname}${location.search}`);
    }

    function showArticle(id, updateHash = true) {
        const card = document.getElementById(id);
        if (!card) return showWelcome(updateHash);

        activeId = id;
        document.getElementById("wikiSimpleWelcome")?.setAttribute("hidden", "");
        cards.forEach(item => item.classList.toggle("wiki-simple-active", item === card));
        document.querySelectorAll(".wiki-simple-link").forEach(link => {
            link.classList.toggle("active", link.dataset.articleId === id);
        });

        const mobile = document.getElementById("wikiSimpleMobileSelect");
        if (mobile) mobile.value = id;

        setHeader(titleFor(card), card.querySelector(".wiki-card-id")?.textContent?.trim() || "District Wiki");

        if (updateHash && history.replaceState) history.replaceState(null, "", `#${id}`);
        if (window.innerWidth < 980) {
            document.querySelector(".wiki-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function buildWelcome() {
        const grid = document.getElementById("wikiGrid");
        if (!grid || document.getElementById("wikiSimpleWelcome")) return;

        const welcome = document.createElement("section");
        welcome.id = "wikiSimpleWelcome";
        welcome.className = "wiki-simple-welcome";
        welcome.innerHTML = `
            <span>The District Knowledge Base</span>
            <h2>Welcome.</h2>
            <p>
                Use the menu to find exactly what you need. Start with joining the server, then use the guides for
                locations, licences, jobs, public services, roleplay terms and support. The District is a 16+ community,
                so make sure you read the current rules before entering the city.
            </p>
            <div class="wiki-simple-welcome-grid">
                <button type="button" data-wiki-jump="wiki-join"><strong>How to join</strong><span>Discord, whitelist and getting approved.</span></button>
                <button type="button" data-wiki-jump="wiki-first-hour"><strong>Your first hour</strong><span>What to do after entering the city.</span></button>
                <button type="button" data-wiki-jump="wiki-locations"><strong>Where things are</strong><span>City Hall, PDM, services and businesses.</span></button>
            </div>
        `;
        grid.insertAdjacentElement("beforebegin", welcome);

        welcome.querySelectorAll("[data-wiki-jump]").forEach(button => {
            button.addEventListener("click", () => showArticle(button.dataset.wikiJump));
        });
    }

    function buildNavigation() {
        const firstCard = document.querySelector(".wiki-sidebar .wiki-side-card");
        if (!firstCard) return;

        const oldCategories = document.getElementById("wikiCategories");
        oldCategories?.remove();

        let nav = document.getElementById("wikiSimpleNav");
        if (!nav) {
            nav = document.createElement("div");
            nav.id = "wikiSimpleNav";
            nav.className = "wiki-simple-nav";
            firstCard.appendChild(nav);
        }

        const groups = new Map(GROUPS.map(group => [group.key, []]));
        cards.forEach(card => groups.get(firstCategory(card))?.push(card));

        nav.innerHTML = `
            <div class="wiki-simple-group">
                <span class="wiki-simple-group-title">Start Here</span>
                <button class="wiki-simple-link active" type="button" data-article-id="welcome">
                    <span class="wiki-simple-link-icon">⌂</span><span>Welcome</span>
                </button>
            </div>
            ${GROUPS.map(group => {
                const items = groups.get(group.key) || [];
                if (!items.length) return "";
                return `
                    <div class="wiki-simple-group" data-wiki-simple-group="${group.key}">
                        <span class="wiki-simple-group-title">${group.label}</span>
                        ${items.map(card => `
                            <button class="wiki-simple-link" type="button" data-article-id="${card.id}" data-search="${titleFor(card).toLowerCase()} ${(card.dataset.search || "").toLowerCase()}">
                                <span class="wiki-simple-link-icon">${group.icon}</span><span>${titleFor(card)}</span>
                            </button>
                        `).join("")}
                    </div>
                `;
            }).join("")}
        `;

        nav.querySelectorAll(".wiki-simple-link").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.dataset.articleId;
                id === "welcome" ? showWelcome() : showArticle(id);
            });
        });

        let mobile = document.getElementById("wikiSimpleMobileSelect");
        if (!mobile) {
            mobile = document.createElement("select");
            mobile.id = "wikiSimpleMobileSelect";
            mobile.className = "wiki-simple-mobile-select";
            firstCard.prepend(mobile);
        }

        mobile.innerHTML = `
            <option value="welcome">Welcome</option>
            ${GROUPS.map(group => {
                const items = groups.get(group.key) || [];
                if (!items.length) return "";
                return `<optgroup label="${group.label}">${items.map(card => `<option value="${card.id}">${titleFor(card)}</option>`).join("")}</optgroup>`;
            }).join("")}
        `;
        mobile.addEventListener("change", () => {
            mobile.value === "welcome" ? showWelcome() : showArticle(mobile.value);
        });
    }

    function replaceSearchBehaviour() {
        const input = document.getElementById("wikiSearch");
        const clear = document.getElementById("wikiSearchClear");
        if (!input) return;

        const filter = () => {
            const q = input.value.trim().toLowerCase();
            const links = [...document.querySelectorAll(".wiki-simple-link[data-article-id]")];
            let firstMatch = null;

            links.forEach(link => {
                if (link.dataset.articleId === "welcome") {
                    link.hidden = Boolean(q);
                    return;
                }
                const text = `${link.textContent} ${link.dataset.search || ""}`.toLowerCase();
                const match = !q || q.split(/\s+/).every(token => text.includes(token));
                link.hidden = !match;
                if (match && !firstMatch) firstMatch = link;
            });

            document.querySelectorAll("[data-wiki-simple-group]").forEach(group => {
                const visible = [...group.querySelectorAll(".wiki-simple-link")].some(link => !link.hidden);
                group.hidden = !visible;
            });

            if (q && firstMatch) {
                showArticle(firstMatch.dataset.articleId, false);
                setHeader(`Search: ${input.value.trim()}`, "Best matching guide");
            } else if (q && !firstMatch) {
                showWelcome(false);
                setHeader(`No result for “${input.value.trim()}”`, "Try another search");
            }
        };

        input.addEventListener("input", filter, true);
        input.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                input.value = "";
                filter();
            }
        }, true);

        clear?.addEventListener("click", () => {
            input.value = "";
            document.querySelectorAll(".wiki-simple-link, [data-wiki-simple-group]").forEach(el => el.hidden = false);
            showWelcome(false);
            input.focus();
        }, true);
    }

    function initialise() {
        const grid = document.getElementById("wikiGrid");
        if (!grid) return;

        cards = [...grid.querySelectorAll(".wiki-card")];
        if (!cards.length) return;

        cards.forEach(card => card.classList.remove("wiki-simple-active"));
        buildWelcome();
        buildNavigation();
        replaceSearchBehaviour();

        const requested = location.hash.replace(/^#/, "");
        if (requested && document.getElementById(requested)?.classList.contains("wiki-card")) {
            showArticle(requested, false);
        } else {
            showWelcome(false);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => window.setTimeout(initialise, 60), { once: true });
    } else {
        window.setTimeout(initialise, 60);
    }
})();
