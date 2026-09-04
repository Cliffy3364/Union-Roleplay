/* ==========================================================
   THE DISTRICT WIKI
========================================================== */
(function () {
    let activeCategory = "all";

    function normalise(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9+\s-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function articleText(card) {
        return normalise([
            card.dataset.search || "",
            card.dataset.category || "",
            card.textContent || ""
        ].join(" "));
    }

    function matchesSearch(card, query) {
        if (!query) return true;
        const text = articleText(card);
        const tokens = normalise(query).split(" ").filter(Boolean);
        return tokens.every(token => text.includes(token));
    }

    function matchesCategory(card) {
        if (activeCategory === "all") return true;
        return String(card.dataset.category || "")
            .split(/\s+/)
            .includes(activeCategory);
    }

    function updateWiki() {
        const search = document.getElementById("wikiSearch");
        const cards = [...document.querySelectorAll("#wikiGrid .wiki-card")];
        const query = search?.value || "";
        let visible = 0;

        cards.forEach(card => {
            const show = matchesCategory(card) && matchesSearch(card, query);
            card.hidden = !show;
            if (show) visible++;
        });

        let empty = document.getElementById("wikiEmptyState");
        if (!empty) {
            empty = document.createElement("div");
            empty.id = "wikiEmptyState";
            empty.className = "wiki-empty";
            empty.innerHTML = "<strong>No matching guide found.</strong><br><span>Try a shorter search such as “licence”, “phone”, “job”, “police” or “support”.</span>";
            document.getElementById("wikiGrid")?.appendChild(empty);
        }
        empty.hidden = visible > 0;

        const count = document.getElementById("wikiResultCount");
        if (count) count.textContent = `${visible} ${visible === 1 ? "article" : "articles"}`;

        const title = document.getElementById("wikiResultsTitle");
        if (title) {
            const labels = {
                all: "All District guides",
                start: "Getting started",
                locations: "Where things are",
                systems: "City systems",
                services: "Public services",
                roleplay: "Roleplay help",
                support: "Support & help"
            };
            title.textContent = query.trim()
                ? `Search results for “${query.trim()}”`
                : (labels[activeCategory] || "District guides");
        }
    }

    function setupCategories() {
        document.querySelectorAll("[data-wiki-category]").forEach(button => {
            button.addEventListener("click", () => {
                activeCategory = button.dataset.wikiCategory || "all";
                document.querySelectorAll("[data-wiki-category]").forEach(item => {
                    item.classList.toggle("active", item === button);
                });
                updateWiki();
            });
        });
    }

    function setupSearch() {
        const search = document.getElementById("wikiSearch");
        const clear = document.getElementById("wikiSearchClear");

        search?.addEventListener("input", updateWiki);
        search?.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            search.value = "";
            updateWiki();
        });

        clear?.addEventListener("click", () => {
            if (search) {
                search.value = "";
                search.focus();
            }
            activeCategory = "all";
            document.querySelectorAll("[data-wiki-category]").forEach(button => {
                button.classList.toggle("active", button.dataset.wikiCategory === "all");
            });
            updateWiki();
        });
    }

    function setupHashFocus() {
        if (!window.location.hash) return;
        const target = document.querySelector(window.location.hash);
        if (!target) return;
        window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupCategories();
        setupSearch();
        updateWiki();
        setupHashFocus();
    });
})();
