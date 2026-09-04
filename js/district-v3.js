/* ==========================================================
   THE DISTRICT — V3 INTERACTIONS + WIKI PUBLISHER
========================================================== */
(function () {
    const WIKI_API = "/api/wiki";
    const WIKI_DRAFT_KEY = "district_staff_wiki_draft_v1";

    const CATEGORY_LABELS = {
        start: "Getting Started",
        locations: "Where Things Are",
        systems: "City Systems",
        services: "Public Services",
        roleplay: "Roleplay Help",
        support: "Support & Help"
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function nl2br(value) {
        return escapeHtml(value).replace(/\r?\n/g, "<br>");
    }

    function sessionToken() {
        return localStorage.getItem("district_session") || "";
    }

    function parsePairLines(value) {
        return String(value || "")
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .slice(0, 20)
            .map(line => {
                const divider = line.indexOf("|");
                if (divider === -1) return { title: line, text: "" };
                return {
                    title: line.slice(0, divider).trim(),
                    text: line.slice(divider + 1).trim()
                };
            });
    }

    function parseFactLines(value) {
        return parsePairLines(value).map(item => ({
            label: item.title,
            value: item.text
        }));
    }

    function articleCategories(article) {
        return [article.category, ...(article.secondary_categories || [])]
            .filter(Boolean)
            .join(" ");
    }

    function articleSearchText(article) {
        return [
            article.search_keywords,
            article.title,
            article.summary,
            article.body,
            ...(article.steps || []).flatMap(step => [step.title, step.text]),
            ...(article.facts || []).flatMap(fact => [fact.label, fact.value])
        ].filter(Boolean).join(" ");
    }

    function articleMarkup(article, preview = false) {
        const categories = articleCategories(article);
        const label = CATEGORY_LABELS[article.category] || "District Wiki";
        const steps = Array.isArray(article.steps) ? article.steps : [];
        const facts = Array.isArray(article.facts) ? article.facts : [];
        const paragraphs = String(article.body || "")
            .split(/\n{2,}/)
            .map(item => item.trim())
            .filter(Boolean);

        return `
            <article
                class="wiki-card ${article.featured ? "wide" : ""} v3-managed-wiki-card"
                ${preview ? "" : `id="${escapeHtml(article.id)}"`}
                data-category="${escapeHtml(categories)}"
                data-search="${escapeHtml(articleSearchText(article))}"
            >
                <div class="wiki-card-head">
                    <span class="wiki-card-tag">${escapeHtml(label)}</span>
                    <span class="wiki-card-id">${escapeHtml(article.ref || "NEW")}</span>
                </div>
                ${article.image_url ? `<img class="v3-wiki-cover" src="${escapeHtml(article.image_url)}" alt="" loading="lazy">` : ""}
                <h3>${escapeHtml(article.title || "Untitled Wiki Article")}</h3>
                ${article.summary ? `<p class="v3-wiki-summary">${escapeHtml(article.summary)}</p>` : ""}
                ${paragraphs.map(paragraph => `<p>${nl2br(paragraph)}</p>`).join("")}
                ${steps.length ? `
                    <div class="wiki-steps">
                        ${steps.map((step, index) => `
                            <div class="wiki-step">
                                <b>${String(index + 1).padStart(2, "0")}</b>
                                <div><strong>${escapeHtml(step.title || "Step")}</strong><span>${escapeHtml(step.text || "")}</span></div>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}
                ${facts.length ? `
                    <div class="wiki-location-list">
                        ${facts.map(fact => `
                            <div class="wiki-location"><strong>${escapeHtml(fact.label || "Info")}</strong><span>${escapeHtml(fact.value || "")}</span></div>
                        `).join("")}
                    </div>
                ` : ""}
                ${article.callout ? `<div class="wiki-callout ${article.callout_style === "amber" ? "amber" : ""}">${escapeHtml(article.callout)}</div>` : ""}
                ${!preview && article.updated_at ? `<div class="v3-wiki-managed-meta">COMMUNITY WIKI • UPDATED ${escapeHtml(new Date(article.updated_at).toLocaleDateString("en-GB"))}</div>` : ""}
            </article>
        `;
    }

    /* ----------------------------------------------------------
       PUBLIC WIKI — LOAD STAFF-PUBLISHED ARTICLES
    ---------------------------------------------------------- */
    async function loadManagedWikiArticles() {
        const grid = document.getElementById("wikiGrid");
        if (!grid) return;

        try {
            const response = await fetch(`${WIKI_API}?t=${Date.now()}`, {
                headers: { Accept: "application/json" },
                cache: "no-store"
            });
            const data = await response.json();
            if (!response.ok || data?.success !== true) throw new Error(data?.error || "Wiki service unavailable.");

            grid.querySelectorAll(".v3-managed-wiki-card").forEach(card => card.remove());

            (data.articles || []).forEach(article => {
                grid.insertAdjacentHTML("afterbegin", articleMarkup(article));
            });

            const search = document.getElementById("wikiSearch");
            search?.dispatchEvent(new Event("input", { bubbles: true }));

            if (window.location.hash) {
                const target = document.querySelector(window.location.hash);
                if (target?.classList.contains("v3-managed-wiki-card")) {
                    window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
                }
            }
        } catch (error) {
            console.warn("Managed Wiki articles could not be loaded:", error);
        }
    }

    /* ----------------------------------------------------------
       STAFF WIKI MANAGER
    ---------------------------------------------------------- */
    function ensureWikiManagerNav() {
        if (!document.getElementById("staffPanel") || document.getElementById("wikiManagerNav")) return;

        const changelog = document.getElementById("changeLogNav");
        const managementHeading = [...document.querySelectorAll(".staff-nav-heading")]
            .find(item => item.textContent.trim().toUpperCase() === "MANAGEMENT");
        const group = changelog?.closest(".staff-nav-group") || managementHeading?.closest(".staff-nav-group");
        if (!group) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "staff-nav-item";
        button.dataset.view = "wiki-manager";
        button.id = "wikiManagerNav";
        button.innerHTML = `
            <span class="staff-nav-content">
                <span class="staff-nav-icon">WK</span>
                <span>Wiki Manager</span>
            </span>
            <span class="v3-nav-new">NEW</span>
        `;

        changelog ? changelog.insertAdjacentElement("afterend", button) : group.appendChild(button);
    }

    function ensureWikiManagerView() {
        const panel = document.getElementById("staffPanel");
        if (!panel || document.getElementById("staffWikiManagerView")) return;

        const view = document.createElement("section");
        view.id = "staffWikiManagerView";
        view.className = "v3-wiki-manager";
        view.hidden = true;
        view.innerHTML = `
            <div class="v3-wiki-manager-hero">
                <div>
                    <span>KNOWLEDGE CONTROL / PUBLIC WIKI</span>
                    <h2>Wiki Publisher</h2>
                    <p>Create, update and remove public guides without editing HTML. Published articles appear in the searchable District Wiki.</p>
                </div>
                <div class="v3-wiki-manager-actions">
                    <span><i></i> LIVE CONTENT SYSTEM</span>
                    <a href="/pages/wiki.html" target="_blank" rel="noopener" class="discipline-secondary-button">Open Public Wiki ↗</a>
                </div>
            </div>

            <div class="v3-wiki-manager-grid">
                <section class="staff-dashboard-panel v3-wiki-compose">
                    <div class="staff-panel-header">
                        <div><span>ARTICLE BUILDER</span><h2 id="wikiManagerFormTitle">New Wiki Article</h2><p>Write it once here. The public Wiki card is generated automatically.</p></div>
                        <div class="staff-panel-reference"><span>STATUS</span><strong id="wikiManagerDraftStatus">Draft autosave ready</strong></div>
                    </div>
                    <div class="staff-panel-divider"></div>

                    <form id="wikiManagerForm">
                        <input type="hidden" id="wikiManagerId">

                        <div class="v3-wiki-form-grid">
                            <div class="changelog-field full">
                                <label for="wikiManagerTitle">Article title</label>
                                <input id="wikiManagerTitle" maxlength="120" placeholder="e.g. How to use the vehicle garage" required>
                            </div>

                            <div class="changelog-field">
                                <label for="wikiManagerCategory">Main category</label>
                                <select id="wikiManagerCategory">
                                    <option value="start">Getting Started</option>
                                    <option value="locations">Where Things Are</option>
                                    <option value="systems">City Systems</option>
                                    <option value="services">Public Services</option>
                                    <option value="roleplay">Roleplay Help</option>
                                    <option value="support">Support & Help</option>
                                </select>
                            </div>

                            <div class="changelog-field">
                                <label for="wikiManagerSecondary">Extra categories</label>
                                <input id="wikiManagerSecondary" maxlength="200" placeholder="systems, locations">
                                <small>Optional. Separate category keys with commas.</small>
                            </div>

                            <div class="changelog-field full">
                                <label for="wikiManagerKeywords">Search keywords</label>
                                <input id="wikiManagerKeywords" maxlength="500" placeholder="garage vehicle store retrieve impound car">
                                <small>Add words players are likely to search for.</small>
                            </div>

                            <div class="changelog-field full">
                                <label for="wikiManagerSummary">Short summary</label>
                                <textarea id="wikiManagerSummary" rows="3" maxlength="700" placeholder="Explain what this guide helps the player do..."></textarea>
                            </div>

                            <div class="changelog-field full">
                                <label for="wikiManagerBody">Main article</label>
                                <textarea id="wikiManagerBody" rows="9" maxlength="12000" placeholder="Write the guide in plain English. Leave a blank line between paragraphs."></textarea>
                            </div>

                            <div class="changelog-field">
                                <label for="wikiManagerSteps">Steps</label>
                                <textarea id="wikiManagerSteps" rows="7" placeholder="Go to PDM | Find the dealership marker\nChoose a vehicle | Browse the available stock\nPurchase | Complete the purchase in character"></textarea>
                                <small>One per line: Step title | explanation</small>
                            </div>

                            <div class="changelog-field">
                                <label for="wikiManagerFacts">Quick facts / locations</label>
                                <textarea id="wikiManagerFacts" rows="7" placeholder="Location | Premium Deluxe Motorsport\nUsed for | Vehicles and temporary DMV"></textarea>
                                <small>One per line: Label | information</small>
                            </div>

                            <div class="changelog-field full">
                                <label for="wikiManagerCallout">Important note / callout</label>
                                <textarea id="wikiManagerCallout" rows="3" maxlength="900" placeholder="Optional warning, tip or important note..."></textarea>
                            </div>

                            <div class="changelog-field">
                                <label for="wikiManagerCalloutStyle">Callout style</label>
                                <select id="wikiManagerCalloutStyle">
                                    <option value="default">Information</option>
                                    <option value="amber">Important / Warning</option>
                                </select>
                            </div>

                            <div class="changelog-field">
                                <label for="wikiManagerImage">Header image URL</label>
                                <input id="wikiManagerImage" type="url" maxlength="600" placeholder="https://... (optional)">
                            </div>
                        </div>

                        <label class="v3-wiki-featured-toggle">
                            <input type="checkbox" id="wikiManagerFeatured">
                            <span><strong>Feature this article</strong><small>Makes the article use a wider layout on the public Wiki.</small></span>
                        </label>

                        <div id="wikiManagerMessage" class="changelog-form-message" hidden></div>

                        <div class="v3-wiki-form-actions">
                            <button type="button" class="discipline-secondary-button" id="wikiManagerNew">New Article</button>
                            <button type="submit" class="btn primary" id="wikiManagerPublish">Publish to Wiki ↗</button>
                        </div>
                    </form>
                </section>

                <aside class="v3-wiki-manager-side">
                    <section class="staff-dashboard-panel v3-wiki-preview-panel">
                        <div class="staff-panel-header"><div><span>LIVE PREVIEW</span><h2>Public Wiki Card</h2><p>Updates while you type.</p></div></div>
                        <div class="staff-panel-divider"></div>
                        <div id="wikiManagerPreview" class="v3-wiki-preview"></div>
                    </section>

                    <section class="staff-dashboard-panel v3-wiki-library-panel">
                        <div class="staff-panel-header">
                            <div><span>PUBLISHED FROM STAFF PANEL</span><h2>Wiki Library</h2><p>Edit or remove articles created through this manager.</p></div>
                            <button type="button" class="discipline-secondary-button" id="wikiManagerRefresh">Refresh</button>
                        </div>
                        <div class="staff-panel-divider"></div>
                        <div id="wikiManagerLibrary"><div class="member-management-empty"><h3>Loading Wiki...</h3></div></div>
                    </section>
                </aside>
            </div>
        `;

        panel.appendChild(view);
    }

    function wikiManagerArticleFromForm() {
        const secondary = String(document.getElementById("wikiManagerSecondary")?.value || "")
            .split(",")
            .map(item => item.trim().toLowerCase())
            .filter(item => CATEGORY_LABELS[item]);

        return {
            title: document.getElementById("wikiManagerTitle")?.value.trim() || "",
            category: document.getElementById("wikiManagerCategory")?.value || "start",
            secondary_categories: [...new Set(secondary)],
            search_keywords: document.getElementById("wikiManagerKeywords")?.value.trim() || "",
            summary: document.getElementById("wikiManagerSummary")?.value.trim() || "",
            body: document.getElementById("wikiManagerBody")?.value.trim() || "",
            steps: parsePairLines(document.getElementById("wikiManagerSteps")?.value),
            facts: parseFactLines(document.getElementById("wikiManagerFacts")?.value),
            callout: document.getElementById("wikiManagerCallout")?.value.trim() || "",
            callout_style: document.getElementById("wikiManagerCalloutStyle")?.value || "default",
            image_url: document.getElementById("wikiManagerImage")?.value.trim() || "",
            featured: document.getElementById("wikiManagerFeatured")?.checked === true
        };
    }

    function wikiManagerUpdatePreview() {
        const target = document.getElementById("wikiManagerPreview");
        if (!target) return;
        const article = wikiManagerArticleFromForm();
        article.id = "preview";
        article.ref = document.getElementById("wikiManagerId")?.value ? "EDITING" : "PREVIEW";
        if (!article.title) article.title = "Your Wiki article will appear here";
        if (!article.summary && !article.body && !article.steps.length && !article.facts.length) {
            article.summary = "Start typing on the left to build the public guide preview.";
        }
        target.innerHTML = articleMarkup(article, true);
    }

    function wikiManagerShowMessage(text, type = "success") {
        const message = document.getElementById("wikiManagerMessage");
        if (!message) return;
        message.hidden = !text;
        message.className = `changelog-form-message ${type}`;
        message.textContent = text || "";
    }

    function wikiManagerCollectDraft() {
        const ids = [
            "wikiManagerId", "wikiManagerTitle", "wikiManagerCategory", "wikiManagerSecondary",
            "wikiManagerKeywords", "wikiManagerSummary", "wikiManagerBody", "wikiManagerSteps",
            "wikiManagerFacts", "wikiManagerCallout", "wikiManagerCalloutStyle", "wikiManagerImage"
        ];
        const values = {};
        ids.forEach(id => {
            const field = document.getElementById(id);
            if (field) values[id] = field.value;
        });
        values.wikiManagerFeatured = document.getElementById("wikiManagerFeatured")?.checked === true;
        return { updated_at: Date.now(), values };
    }

    function wikiManagerSaveDraft() {
        const form = document.getElementById("wikiManagerForm");
        if (!form) return;
        try {
            localStorage.setItem(WIKI_DRAFT_KEY, JSON.stringify(wikiManagerCollectDraft()));
            const label = document.getElementById("wikiManagerDraftStatus");
            if (label) label.textContent = `Saved ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
        } catch {}
    }

    function wikiManagerRestoreDraft() {
        let draft;
        try { draft = JSON.parse(localStorage.getItem(WIKI_DRAFT_KEY) || "null"); } catch { draft = null; }
        if (!draft?.values) return;

        Object.entries(draft.values).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (!field) return;
            if (id === "wikiManagerFeatured") field.checked = value === true;
            else field.value = value ?? "";
        });

        const id = document.getElementById("wikiManagerId")?.value;
        const title = document.getElementById("wikiManagerFormTitle");
        if (title) title.textContent = id ? "Edit Wiki Article" : "New Wiki Article";

        const status = document.getElementById("wikiManagerDraftStatus");
        if (status) {
            status.textContent = `Restored ${new Date(draft.updated_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`;
        }
        wikiManagerUpdatePreview();
    }

    function wikiManagerReset(clearSaved = true) {
        const form = document.getElementById("wikiManagerForm");
        form?.reset();
        const id = document.getElementById("wikiManagerId");
        if (id) id.value = "";
        const title = document.getElementById("wikiManagerFormTitle");
        if (title) title.textContent = "New Wiki Article";
        wikiManagerShowMessage("");
        if (clearSaved) localStorage.removeItem(WIKI_DRAFT_KEY);
        const status = document.getElementById("wikiManagerDraftStatus");
        if (status) status.textContent = "Draft autosave ready";
        wikiManagerUpdatePreview();
    }

    async function wikiManagerFetchArticles() {
        const target = document.getElementById("wikiManagerLibrary");
        if (!target) return [];
        target.innerHTML = `<div class="member-management-empty"><h3>Loading Wiki...</h3><p>Reading the latest published content.</p></div>`;

        try {
            const response = await fetch(`${WIKI_API}?t=${Date.now()}`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok || data?.success !== true) throw new Error(data?.error || "Unable to load Wiki.");
            const articles = Array.isArray(data.articles) ? data.articles : [];
            renderWikiManagerLibrary(articles);
            return articles;
        } catch (error) {
            target.innerHTML = `<div class="member-management-empty"><h3>Wiki unavailable</h3><p>${escapeHtml(error.message || "Unable to load articles.")}</p></div>`;
            return [];
        }
    }

    function renderWikiManagerLibrary(articles) {
        const target = document.getElementById("wikiManagerLibrary");
        if (!target) return;
        target.dataset.articles = JSON.stringify(articles || []);

        if (!articles.length) {
            target.innerHTML = `<div class="member-management-empty"><div class="member-empty-icon">WK</div><h3>No staff-published articles yet</h3><p>Your first published guide will appear here.</p></div>`;
            return;
        }

        target.innerHTML = articles.map(article => `
            <article class="v3-wiki-library-row">
                <div class="v3-wiki-library-ref">${escapeHtml(article.ref || "KB")}</div>
                <div class="v3-wiki-library-main">
                    <span>${escapeHtml(CATEGORY_LABELS[article.category] || "District Wiki")}</span>
                    <strong>${escapeHtml(article.title)}</strong>
                    <small>Updated ${escapeHtml(article.updated_at ? new Date(article.updated_at).toLocaleString("en-GB") : "recently")} ${article.updated_by ? `• ${escapeHtml(article.updated_by)}` : ""}</small>
                </div>
                <div class="v3-wiki-library-actions">
                    <button type="button" class="discipline-secondary-button" data-wiki-edit="${escapeHtml(article.id)}">Edit</button>
                    <button type="button" class="v3-danger-button" data-wiki-delete="${escapeHtml(article.id)}">Delete</button>
                </div>
            </article>
        `).join("");

        target.querySelectorAll("[data-wiki-edit]").forEach(button => {
            button.addEventListener("click", () => {
                const article = articles.find(item => item.id === button.dataset.wikiEdit);
                if (article) wikiManagerEditArticle(article);
            });
        });

        target.querySelectorAll("[data-wiki-delete]").forEach(button => {
            button.addEventListener("click", async () => {
                const article = articles.find(item => item.id === button.dataset.wikiDelete);
                if (!article || !window.confirm(`Delete “${article.title}” from the public Wiki?`)) return;
                button.disabled = true;
                try {
                    const response = await fetch(WIKI_API, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${sessionToken()}`
                        },
                        body: JSON.stringify({ action: "delete", id: article.id })
                    });
                    const data = await response.json();
                    if (!response.ok || data?.success !== true) throw new Error(data?.error || "Unable to delete article.");
                    wikiManagerShowMessage("Wiki article removed. The public Wiki will reflect the change immediately.", "success");
                    await wikiManagerFetchArticles();
                    if (document.getElementById("wikiManagerId")?.value === article.id) wikiManagerReset();
                } catch (error) {
                    wikiManagerShowMessage(error.message || "Unable to delete article.", "error");
                    button.disabled = false;
                }
            });
        });
    }

    function wikiManagerEditArticle(article) {
        const set = (id, value) => {
            const field = document.getElementById(id);
            if (field) field.value = value ?? "";
        };
        set("wikiManagerId", article.id);
        set("wikiManagerTitle", article.title);
        set("wikiManagerCategory", article.category || "start");
        set("wikiManagerSecondary", (article.secondary_categories || []).join(", "));
        set("wikiManagerKeywords", article.search_keywords);
        set("wikiManagerSummary", article.summary);
        set("wikiManagerBody", article.body);
        set("wikiManagerSteps", (article.steps || []).map(step => `${step.title || ""} | ${step.text || ""}`).join("\n"));
        set("wikiManagerFacts", (article.facts || []).map(fact => `${fact.label || ""} | ${fact.value || ""}`).join("\n"));
        set("wikiManagerCallout", article.callout);
        set("wikiManagerCalloutStyle", article.callout_style || "default");
        set("wikiManagerImage", article.image_url);
        const featured = document.getElementById("wikiManagerFeatured");
        if (featured) featured.checked = article.featured === true;

        const heading = document.getElementById("wikiManagerFormTitle");
        if (heading) heading.textContent = "Edit Wiki Article";
        wikiManagerShowMessage(`Editing ${article.ref || "Wiki article"}. Publish when you are ready to save the changes.`, "info");
        wikiManagerUpdatePreview();
        wikiManagerSaveDraft();
        document.querySelector(".v3-wiki-compose")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function wikiManagerSubmit(event) {
        event.preventDefault();
        const token = sessionToken();
        if (!token) {
            wikiManagerShowMessage("Your staff session has expired. Log in again before publishing.", "error");
            return;
        }

        const id = document.getElementById("wikiManagerId")?.value || "";
        const article = wikiManagerArticleFromForm();
        const button = document.getElementById("wikiManagerPublish");

        if (!article.title) {
            wikiManagerShowMessage("Give the Wiki article a title first.", "error");
            return;
        }
        if (!article.summary && !article.body && !article.steps.length && !article.facts.length) {
            wikiManagerShowMessage("Add some actual guide content before publishing.", "error");
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = id ? "Saving changes..." : "Publishing...";
        }

        try {
            const response = await fetch(WIKI_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: id ? "update" : "create",
                    id: id || undefined,
                    article
                })
            });
            const data = await response.json();
            if (!response.ok || data?.success !== true) throw new Error(data?.error || "Unable to publish Wiki article.");

            localStorage.removeItem(WIKI_DRAFT_KEY);
            wikiManagerShowMessage(
                id
                    ? "Wiki article updated. The public Wiki now reads the latest version from GitHub."
                    : "Wiki article published. It is now available through the public Wiki feed.",
                "success"
            );
            wikiManagerReset(false);
            await wikiManagerFetchArticles();
        } catch (error) {
            wikiManagerShowMessage(error.message || "Unable to publish Wiki article.", "error");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Publish to Wiki ↗";
            }
        }
    }

    function showWikiManager() {
        if (typeof window.hideAllViews === "function") window.hideAllViews();
        const view = document.getElementById("staffWikiManagerView");
        if (view) view.hidden = false;
        const title = document.getElementById("staffPageTitle");
        const description = document.getElementById("staffPageDescription");
        if (title) title.textContent = "Wiki Manager";
        if (description) description.textContent = "Publish and maintain player-facing guides from the Staff Control Centre.";
        if (typeof window.setTopSearch === "function") window.setTopSearch("", false);
        wikiManagerFetchArticles();
        wikiManagerUpdatePreview();
    }

    function setupWikiManager() {
        if (!document.getElementById("staffPanel")) return;
        ensureWikiManagerNav();
        ensureWikiManagerView();

        const nav = document.getElementById("wikiManagerNav");
        nav?.addEventListener("click", () => {
            document.querySelectorAll(".staff-nav-item").forEach(item => item.classList.toggle("active", item === nav));
            showWikiManager();
        });

        document.addEventListener("click", event => {
            const item = event.target.closest?.(".staff-nav-item");
            if (!item || item.id === "wikiManagerNav") return;
            const view = document.getElementById("staffWikiManagerView");
            if (view) view.hidden = true;
        });

        const form = document.getElementById("wikiManagerForm");
        let saveTimer = null;
        const changed = () => {
            wikiManagerUpdatePreview();
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(wikiManagerSaveDraft, 180);
        };
        form?.addEventListener("input", changed);
        form?.addEventListener("change", changed);
        form?.addEventListener("submit", wikiManagerSubmit);
        document.getElementById("wikiManagerNew")?.addEventListener("click", () => wikiManagerReset(true));
        document.getElementById("wikiManagerRefresh")?.addEventListener("click", wikiManagerFetchArticles);
        window.addEventListener("beforeunload", wikiManagerSaveDraft);

        wikiManagerRestoreDraft();
        wikiManagerUpdatePreview();
    }

    /* ----------------------------------------------------------
       V3 HOME EXPERIENCE
    ---------------------------------------------------------- */
    function setupHomePulse() {
        const heroCopy = document.querySelector(".district-v2-home .v2-hero-copy");
        if (!heroCopy || document.getElementById("v3HomePulse")) return;

        const pulse = document.createElement("div");
        pulse.id = "v3HomePulse";
        pulse.className = "v3-home-pulse";
        pulse.innerHTML = `
            <div><span>NETWORK</span><strong id="v3PulseServer"><i></i> CHECKING</strong></div>
            <div><span>ACCESS</span><strong>16+ / WHITELIST</strong></div>
            <div><span>RELEASE</span><strong>18 SEP 2026</strong></div>
            <div><span>KNOWLEDGE</span><a href="/pages/wiki.html">OPEN WIKI ↗</a></div>
        `;
        const actions = heroCopy.querySelector(".v2-actions");
        actions?.insertAdjacentElement("afterend", pulse);

        fetch("https://the-district-api.danielclifford2808.workers.dev/api/community/server", { cache: "no-store" })
            .then(response => response.json())
            .then(data => {
                const target = document.getElementById("v3PulseServer");
                if (!target) return;
                if (data?.online === true) {
                    const count = Number(data.players ?? data.player_count ?? 0);
                    target.innerHTML = `<i class="online"></i> ONLINE${Number.isFinite(count) ? ` / ${count} IN CITY` : ""}`;
                } else {
                    target.innerHTML = `<i class="offline"></i> OFFLINE`;
                }
            })
            .catch(() => {
                const target = document.getElementById("v3PulseServer");
                if (target) target.innerHTML = `<i></i> STATUS UNKNOWN`;
            });
    }

    function setupPageRail() {
        if (document.getElementById("v3PageRail") || document.body.classList.contains("community-page-shell")) return;
        const rail = document.createElement("div");
        rail.id = "v3PageRail";
        rail.className = "v3-page-rail";
        rail.innerHTML = `<span>THE DISTRICT</span><i></i><span>16+</span><i></i><span>BRITISH ROLEPLAY</span>`;
        document.body.appendChild(rail);
    }

    function initialise() {
        setupHomePulse();
        setupPageRail();
        setupWikiManager();
        loadManagedWikiArticles();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => window.setTimeout(initialise, 80), { once: true });
    } else {
        window.setTimeout(initialise, 80);
    }
})();
