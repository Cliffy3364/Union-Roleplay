/* ==========================================================
   THE DISTRICT — MANAGED APPLICATION DIRECTORY V8
   Builds the public Applications page from the managed catalog
   and always uses absolute application URLs.
========================================================== */
(function () {
    const CATALOG_API = "/api/application-catalog";

    const escapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    function applyHref(type) {
        return `/pages/apply.html?type=${encodeURIComponent(String(type || ""))}`;
    }

    function normaliseExistingLinks(root = document) {
        root.querySelectorAll("[data-application-card]").forEach(card => {
            const type = card.dataset.applicationType || "";
            const link = card.querySelector("[data-application-link]");
            if (!type || !link) return;
            const href = applyHref(type);
            link.href = href;
            link.dataset.originalHref = href;
        });
    }

    function groupCopy(group) {
        const key = String(group || "Other").toLowerCase();
        if (key === "get started") return { kicker: "GET STARTED", title: "Join The District", copy: "New to The District? Start here." };
        if (key === "community") return { kicker: "COMMUNITY", title: "Help run The District", copy: "Community, testing and operational roles." };
        if (key === "media") return { kicker: "MEDIA", title: "Shape how The District is seen", copy: "Content creation, streaming and social media roles." };
        if (key === "development") return { kicker: "DEVELOPMENT", title: "Build the experience", copy: "Technical and asset development roles." };
        if (key === "command") return { kicker: "COMMAND", title: "Lead a department", copy: "Senior department leadership opportunities." };
        if (key === "businesses") return { kicker: "BUSINESSES", title: "Own and run a business", copy: "Create player-run businesses and long-term civilian roleplay." };
        return { kicker: String(group || "OTHER").toUpperCase(), title: String(group || "Other"), copy: "Additional opportunities within The District." };
    }

    function cardMarkup(app) {
        const type = app.application_type;
        const href = applyHref(type);
        return `
            <article class="application-role-card" data-application-card data-application-type="${escapeHtml(type)}">
                <div class="application-role-top">
                    <div class="application-role-icon">${escapeHtml(app.icon || "AP")}</div>
                    <span class="application-role-status" data-application-status><span></span> OPEN</span>
                </div>
                <div class="application-role-content">
                    <span class="application-role-category">${escapeHtml(app.category || app.group || "APPLICATION")}</span>
                    <h3>${escapeHtml(app.title || type)}</h3>
                    <p>${escapeHtml(app.description || "Apply to join this area of The District.")}</p>
                </div>
                <a href="${escapeHtml(href)}" class="application-role-action" data-application-link data-original-href="${escapeHtml(href)}">
                    <span data-application-link-text>${escapeHtml(app.title || type)}</span>
                    <strong>→</strong>
                </a>
            </article>
        `;
    }

    function featuredMarkup(app) {
        const type = app.application_type;
        const href = applyHref(type);
        return `
            <article class="application-featured-card" data-application-card data-application-type="${escapeHtml(type)}">
                <div class="application-featured-background"><span>DISTRICT</span></div>
                <div class="application-featured-top">
                    <div class="application-featured-icon">${escapeHtml(app.icon || "WL")}</div>
                    <div class="application-featured-status" data-application-status><span></span> APPLICATIONS OPEN</div>
                </div>
                <div class="application-featured-content">
                    <span class="application-featured-category">${escapeHtml(app.category || "GENERAL SERVER ACCESS")}</span>
                    <h2>${escapeHtml(app.title || type)}</h2>
                    <p>${escapeHtml(app.description || "Start your journey in The District.")}</p>
                    <div class="application-featured-details">
                        <div><span>TYPE</span><strong>${escapeHtml(app.group || "Application")}</strong></div>
                        <div><span>PROCESS</span><strong>Application Review</strong></div>
                        <div><span>STATUS</span><strong data-application-detail-status>Open</strong></div>
                    </div>
                </div>
                <div class="application-featured-action">
                    <div><span data-application-action-kicker>READY TO BEGIN?</span><strong data-application-action-title>Start your application</strong></div>
                    <a href="${escapeHtml(href)}" class="application-featured-button" data-application-link data-original-href="${escapeHtml(href)}"><span data-application-link-text>Apply Now</span><span>→</span></a>
                </div>
            </article>
        `;
    }

    function renderCatalog(applications) {
        const container = document.querySelector(".applications-content .applications-container");
        if (!container || !Array.isArray(applications) || !applications.length) return false;

        const bottomNote = container.querySelector(".applications-bottom-note")?.outerHTML || "";
        const featured = applications.find(app => app.featured === true) || applications.find(app => /whitelist/i.test(app.application_type));
        const remaining = applications.filter(app => !featured || app.application_type !== featured.application_type);
        const groupOrder = ["Community", "Media", "Development", "Command", "Businesses", "Other"];
        const groups = new Map();
        remaining.forEach(app => {
            const group = app.group || "Other";
            if (!groups.has(group)) groups.set(group, []);
            groups.get(group).push(app);
        });

        const orderedGroups = [...groups.entries()].sort(([a], [b]) => {
            const ai = groupOrder.indexOf(a);
            const bi = groupOrder.indexOf(b);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.localeCompare(b);
        });

        let html = "";
        if (featured) {
            const copy = groupCopy(featured.group || "Get Started");
            html += `<div class="applications-group-heading"><div><span>${escapeHtml(copy.kicker)}</span><h2>${escapeHtml(copy.title)}</h2></div><p>${escapeHtml(copy.copy)}</p></div>`;
            html += featuredMarkup(featured);
        }

        orderedGroups.forEach(([group, apps]) => {
            const copy = groupCopy(group);
            html += `
                <div class="applications-group applications-managed-group">
                    <div class="applications-group-heading">
                        <div><span>${escapeHtml(copy.kicker)}</span><h2>${escapeHtml(copy.title)}</h2></div>
                        <p>${escapeHtml(copy.copy)}</p>
                    </div>
                    <div class="applications-role-grid ${apps.length >= 3 ? "applications-role-grid-three" : ""}">
                        ${apps.map(cardMarkup).join("")}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html + bottomNote;
        normaliseExistingLinks(container);
        if (typeof window.loadApplicationAvailability === "function") {
            window.loadApplicationAvailability();
        } else if (typeof loadApplicationAvailability === "function") {
            loadApplicationAvailability();
        }
        return true;
    }

    async function loadManagedApplications() {
        normaliseExistingLinks();
        try {
            const response = await fetch(CATALOG_API, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok || data?.success !== true || !Array.isArray(data.applications)) {
                throw new Error(data?.error || "Application catalog unavailable.");
            }
            renderCatalog(data.applications);
        } catch (error) {
            console.warn("Managed Applications fallback:", error);
            normaliseExistingLinks();
        }
    }

    document.addEventListener("click", event => {
        const link = event.target.closest?.("[data-application-link]");
        if (!link || link.classList.contains("application-link-disabled")) return;
        const card = link.closest("[data-application-card]");
        const type = card?.dataset.applicationType || "";
        if (!type) return;
        const href = applyHref(type);
        link.href = href;
        link.dataset.originalHref = href;
    }, true);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadManagedApplications, { once: true });
    } else {
        loadManagedApplications();
    }
})();
