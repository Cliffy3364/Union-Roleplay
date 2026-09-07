/* ==========================================================
   THE DISTRICT — STAFF CONTENT MANAGEMENT V7
   Stability-first replacement for V6.
========================================================== */
(function () {
    const RULES_API = "/api/rules-manager";
    let rulebook = null;
    let selectedRuleId = "";
    let setupTimer = null;

    const escapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const sessionToken = () => localStorage.getItem("district_session") || "";

    const normalise = value => String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    function flattenedRules(source = rulebook) {
        if (!Array.isArray(source)) return [];
        return source.flatMap(section => (section.rules || []).map(rule => ({
            ...rule,
            sectionNumber: section.number,
            sectionTitle: section.title,
            sectionDescription: section.description
        })));
    }

    /* ----------------------------------------------------------
       MORE EXACT STAFF RULE SEARCH
    ---------------------------------------------------------- */
    function strictRuleMatches(incident) {
        const query = normalise(incident);
        if (query.length < 3) return [];

        let rules = flattenedRules();
        if (!rules.length && typeof window.flattenedRulebook === "function") {
            try { rules = window.flattenedRulebook() || []; } catch { rules = []; }
        }
        if (!rules.length) return [];

        const compact = query.replace(/\s+/g, "");
        const exactId = rules.find(rule => normalise(rule.id).replace(/\s+/g, "") === compact);
        if (exactId) return [{ rule: exactId, score: 1000, reasons: ["Exact rule ID"] }];

        const exactTitles = rules.filter(rule => normalise(rule.title) === query);
        if (exactTitles.length === 1) {
            return [{ rule: exactTitles[0], score: 970, reasons: ["Exact rule title"] }];
        }

        const containedTitles = rules.filter(rule => {
            const title = normalise(rule.title);
            return title.length >= 5 && query.includes(title);
        });
        if (containedTitles.length === 1) {
            return [{ rule: containedTitles[0], score: 900, reasons: ["Rule title found in incident"] }];
        }

        const scored = rules.map(rule => {
            let base = null;
            if (typeof window.scoreRuleSearchMatch === "function") {
                try { base = window.scoreRuleSearchMatch(rule, incident); } catch {}
            }

            if (base && Number(base.score) > 0) return base;

            const searchable = normalise([
                rule.id,
                rule.title,
                rule.punishment,
                rule.description,
                rule.enforcement,
                rule.sectionTitle
            ].join(" "));
            const queryTerms = query.split(" ").filter(word => word.length >= 4);
            const exactWords = new Set(searchable.split(" "));
            const hits = queryTerms.filter(word => exactWords.has(word));
            return {
                rule,
                score: hits.length * 10,
                reasons: hits.length ? [`Matched ${hits.length} exact keyword${hits.length === 1 ? "" : "s"}`] : []
            };
        }).filter(result => Number(result?.score || 0) >= 30)
          .sort((a, b) => b.score - a.score);

        if (!scored.length) return [];
        const best = scored[0].score;
        const threshold = Math.max(42, best * 0.72);

        return scored
            .filter((result, index) => index === 0 || result.score >= threshold)
            .slice(0, 3);
    }

    function installExactRuleSearch() {
        if (typeof window.findPossibleRuleBreaches === "function") {
            window.findPossibleRuleBreaches = strictRuleMatches;
        }
    }

    /* ----------------------------------------------------------
       WIKI MANAGER CHROME
    ---------------------------------------------------------- */
    function tidyWikiManager() {
        document.querySelectorAll(".v3-nav-new").forEach(node => node.remove());

        const library = document.querySelector(".v3-wiki-library-panel .staff-panel-header > div");
        if (library) {
            const label = library.querySelector("span");
            const title = library.querySelector("h2");
            const description = library.querySelector("p");
            if (label && label.textContent !== "ALL PUBLIC WIKI ARTICLES") label.textContent = "ALL PUBLIC WIKI ARTICLES";
            if (title && title.textContent !== "Wiki Library") title.textContent = "Wiki Library";
            if (description && description.textContent !== "Edit or remove any guide that is currently available on the public Wiki.") {
                description.textContent = "Edit or remove any guide that is currently available on the public Wiki.";
            }
        }
    }

    /* ----------------------------------------------------------
       RULES MANAGER UI
    ---------------------------------------------------------- */
    function ensureRulesManagerNav() {
        if (document.getElementById("rulesManagerNav")) return true;
        const wiki = document.getElementById("wikiManagerNav");
        const changelog = document.getElementById("changeLogNav");
        const group = wiki?.closest(".staff-nav-group") || changelog?.closest(".staff-nav-group");
        if (!group) return false;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "staff-nav-item";
        button.dataset.view = "rules-manager";
        button.id = "rulesManagerNav";
        button.innerHTML = `
            <span class="staff-nav-content">
                <span class="staff-nav-icon">RL</span>
                <span>Rules Manager</span>
            </span>
        `;
        (wiki || changelog)?.insertAdjacentElement("afterend", button) || group.appendChild(button);
        return true;
    }

    function ensureRulesManagerView() {
        const panel = document.getElementById("staffPanel");
        if (!panel) return false;
        if (document.getElementById("staffRulesManagerView")) return true;

        const view = document.createElement("section");
        view.id = "staffRulesManagerView";
        view.className = "rules-manager-v6";
        view.hidden = true;
        view.innerHTML = `
            <div class="rules-manager-hero">
                <div>
                    <span>RULEBOOK CONTROL</span>
                    <h2>Rules Manager</h2>
                    <p>Add, update and remove the rules shown on the public District rulebook.</p>
                </div>
                <div class="rules-manager-hero-actions">
                    <a href="/rules.html" target="_blank" rel="noopener" class="discipline-secondary-button">Open Public Rules ↗</a>
                </div>
            </div>

            <div class="rules-manager-layout">
                <section class="staff-dashboard-panel rules-manager-editor">
                    <div class="staff-panel-header">
                        <div>
                            <span>RULE EDITOR</span>
                            <h2 id="rulesManagerHeading">Add a Rule</h2>
                            <p>Select a section and enter the wording that players should see.</p>
                        </div>
                        <div class="staff-panel-reference"><span>STATUS</span><strong id="rulesManagerStatus">Ready</strong></div>
                    </div>
                    <div class="staff-panel-divider"></div>

                    <form id="rulesManagerForm">
                        <div class="rules-manager-field-grid">
                            <div class="changelog-field">
                                <label for="rulesManagerSection">Section</label>
                                <select id="rulesManagerSection" required></select>
                            </div>
                            <div class="changelog-field">
                                <label for="rulesManagerId">Rule ID</label>
                                <input id="rulesManagerId" maxlength="30" placeholder="Leave blank for automatic ID">
                            </div>
                            <div class="changelog-field full">
                                <label for="rulesManagerTitle">Rule title</label>
                                <input id="rulesManagerTitle" maxlength="140" required placeholder="e.g. Combat Logging">
                            </div>
                            <div class="changelog-field full">
                                <label for="rulesManagerPunishment">Punishment / classification</label>
                                <input id="rulesManagerPunishment" list="rulesManagerPunishments" maxlength="80" placeholder="3-Strike System">
                                <datalist id="rulesManagerPunishments">
                                    <option value="3-Strike System"></option>
                                    <option value="FailRP"></option>
                                    <option value="Bannable"></option>
                                    <option value="Permanent Ban"></option>
                                    <option value="Business Strike"></option>
                                    <option value="Business Shutdown"></option>
                                    <option value="Department Strike"></option>
                                </datalist>
                            </div>
                            <div class="changelog-field full">
                                <label for="rulesManagerDescription">Rule wording</label>
                                <textarea id="rulesManagerDescription" rows="5" maxlength="1800" required></textarea>
                            </div>
                            <div class="changelog-field full">
                                <label for="rulesManagerEnforcement">Enforcement guidance</label>
                                <textarea id="rulesManagerEnforcement" rows="4" maxlength="1800"></textarea>
                            </div>
                        </div>

                        <div id="rulesManagerMessage" class="changelog-form-message" hidden></div>
                        <div class="rules-manager-form-actions">
                            <button type="button" class="discipline-secondary-button" id="rulesManagerNew">Clear / New Rule</button>
                            <button type="submit" class="btn primary" id="rulesManagerSave">Add Rule</button>
                        </div>
                    </form>
                </section>

                <aside class="staff-dashboard-panel rules-manager-library">
                    <div class="staff-panel-header rules-manager-library-head">
                        <div><span>CURRENT RULEBOOK</span><h2>Rules</h2><p>Search by rule ID, title or exact wording.</p></div>
                        <button type="button" class="discipline-secondary-button" id="rulesManagerRefresh">Refresh</button>
                    </div>
                    <div class="staff-panel-divider"></div>
                    <div class="rules-manager-search"><span>⌕</span><input id="rulesManagerSearch" type="search" autocomplete="off" placeholder="02.4, RDM, combat logging..."></div>
                    <div id="rulesManagerLibrary" class="rules-manager-list"></div>
                </aside>
            </div>
        `;
        panel.appendChild(view);
        return true;
    }

    function showMessage(text, type = "info") {
        const el = document.getElementById("rulesManagerMessage");
        if (!el) return;
        el.hidden = !text;
        el.className = `changelog-form-message ${type}`;
        el.textContent = text || "";
    }

    async function requestRules(method = "GET", body = null) {
        const response = await fetch(RULES_API, {
            method,
            cache: "no-store",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${sessionToken()}`,
                ...(body ? { "Content-Type": "application/json" } : {})
            },
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success !== true) throw new Error(data?.error || "Rules Manager request failed.");
        return data;
    }

    function fillSections() {
        const select = document.getElementById("rulesManagerSection");
        if (!select || !Array.isArray(rulebook)) return;
        const current = select.value;
        select.innerHTML = rulebook.map(section => `<option value="${escapeHtml(section.number)}">${escapeHtml(section.number)} — ${escapeHtml(section.title)}</option>`).join("");
        if ([...select.options].some(option => option.value === current)) select.value = current;
    }

    function findRule(id) {
        for (const section of rulebook || []) {
            const rule = (section.rules || []).find(item => item.id === id);
            if (rule) return { section, rule };
        }
        return null;
    }

    function renderLibrary() {
        const target = document.getElementById("rulesManagerLibrary");
        if (!target) return;
        if (!Array.isArray(rulebook)) {
            target.innerHTML = `<div class="member-management-empty"><h3>Open Rules Manager to load the rulebook.</h3></div>`;
            return;
        }

        const q = normalise(document.getElementById("rulesManagerSearch")?.value || "");
        const groups = rulebook.map(section => {
            const matches = (section.rules || []).filter(rule => {
                if (!q) return true;
                const id = normalise(rule.id);
                const title = normalise(rule.title);
                const text = normalise(`${rule.id} ${rule.title} ${rule.punishment} ${rule.description} ${rule.enforcement}`);
                if (q === id || q === title) return true;
                return q.split(" ").filter(Boolean).every(token => text.includes(token));
            });
            return { section, matches };
        }).filter(group => group.matches.length);

        if (!groups.length) {
            target.innerHTML = `<div class="member-management-empty"><h3>No matching rules</h3><p>Try the exact ID or a more specific phrase.</p></div>`;
            return;
        }

        target.innerHTML = groups.map(({ section, matches }) => `
            <section class="rules-manager-section">
                <div class="rules-manager-section-title"><span>${escapeHtml(section.number)}</span><div><strong>${escapeHtml(section.title)}</strong><small>${matches.length} rule${matches.length === 1 ? "" : "s"}</small></div></div>
                ${matches.map(rule => `
                    <article class="rules-manager-row ${selectedRuleId === rule.id ? "selected" : ""}">
                        <button type="button" class="rules-manager-row-main" data-rules-edit="${escapeHtml(rule.id)}">
                            <span class="rules-manager-row-id">${escapeHtml(rule.id)}</span>
                            <span class="rules-manager-row-copy"><strong>${escapeHtml(rule.title)}</strong><small>${escapeHtml(rule.punishment || "Rule")}</small></span>
                        </button>
                        <button type="button" class="rules-manager-delete" data-rules-delete="${escapeHtml(rule.id)}" aria-label="Delete rule">×</button>
                    </article>
                `).join("")}
            </section>
        `).join("");

        target.querySelectorAll("[data-rules-edit]").forEach(button => button.addEventListener("click", () => editRule(button.dataset.rulesEdit)));
        target.querySelectorAll("[data-rules-delete]").forEach(button => button.addEventListener("click", () => deleteRule(button.dataset.rulesDelete, button)));
    }

    function editRule(id) {
        const found = findRule(id);
        if (!found) return;
        selectedRuleId = id;
        const values = {
            rulesManagerSection: found.section.number,
            rulesManagerId: found.rule.id,
            rulesManagerTitle: found.rule.title,
            rulesManagerPunishment: found.rule.punishment,
            rulesManagerDescription: found.rule.description,
            rulesManagerEnforcement: found.rule.enforcement
        };
        Object.entries(values).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) field.value = value ?? "";
        });
        document.getElementById("rulesManagerHeading").textContent = `Edit ${id}`;
        document.getElementById("rulesManagerSave").textContent = "Save Rule Changes";
        showMessage(`Editing ${id}.`, "info");
        renderLibrary();
    }

    function resetForm() {
        selectedRuleId = "";
        document.getElementById("rulesManagerForm")?.reset();
        fillSections();
        const heading = document.getElementById("rulesManagerHeading");
        const save = document.getElementById("rulesManagerSave");
        if (heading) heading.textContent = "Add a Rule";
        if (save) save.textContent = "Add Rule";
        showMessage("");
        renderLibrary();
    }

    function ruleFromForm() {
        return {
            id: document.getElementById("rulesManagerId")?.value.trim() || "",
            title: document.getElementById("rulesManagerTitle")?.value.trim() || "",
            punishment: document.getElementById("rulesManagerPunishment")?.value.trim() || "3-Strike System",
            description: document.getElementById("rulesManagerDescription")?.value.trim() || "",
            enforcement: document.getElementById("rulesManagerEnforcement")?.value.trim() || ""
        };
    }

    async function loadRulebook() {
        const status = document.getElementById("rulesManagerStatus");
        const target = document.getElementById("rulesManagerLibrary");
        try {
            if (status) status.textContent = "Loading...";
            if (target) target.innerHTML = `<div class="member-management-empty"><h3>Loading rules...</h3></div>`;
            const data = await requestRules("GET");
            rulebook = Array.isArray(data.rulebook) ? data.rulebook : [];
            window.__districtManagedRulebook = rulebook;
            fillSections();
            renderLibrary();
            installExactRuleSearch();
            if (status) status.textContent = `${data.rules || flattenedRules().length} rules loaded`;
        } catch (error) {
            if (status) status.textContent = "Unavailable";
            if (target) target.innerHTML = `<div class="member-management-empty"><h3>Rules unavailable</h3><p>${escapeHtml(error.message)}</p></div>`;
        }
    }

    async function saveRule(event) {
        event.preventDefault();
        const rule = ruleFromForm();
        if (!rule.title || !rule.description) {
            showMessage("Add a rule title and rule wording first.", "error");
            return;
        }

        const button = document.getElementById("rulesManagerSave");
        if (button) button.disabled = true;
        try {
            const data = await requestRules("POST", {
                action: selectedRuleId ? "update" : "create",
                id: selectedRuleId || undefined,
                section_number: document.getElementById("rulesManagerSection")?.value || "",
                rule
            });
            rulebook = data.rulebook || rulebook;
            window.__districtManagedRulebook = rulebook;
            fillSections();
            selectedRuleId = data.rule?.id || selectedRuleId;
            renderLibrary();
            installExactRuleSearch();
            showMessage(data.message || "Rulebook updated.", "success");
            if (selectedRuleId) editRule(selectedRuleId);
        } catch (error) {
            showMessage(error.message || "Unable to save rule.", "error");
        } finally {
            if (button) button.disabled = false;
        }
    }

    async function deleteRule(id, button) {
        const found = findRule(id);
        if (!found || !window.confirm(`Remove ${id} — ${found.rule.title}?`)) return;
        if (button) button.disabled = true;
        try {
            const data = await requestRules("POST", { action: "delete", id });
            rulebook = data.rulebook || rulebook;
            window.__districtManagedRulebook = rulebook;
            if (selectedRuleId === id) resetForm();
            renderLibrary();
            installExactRuleSearch();
            showMessage(data.message || `Rule ${id} removed.`, "success");
        } catch (error) {
            showMessage(error.message || "Unable to remove rule.", "error");
            if (button) button.disabled = false;
        }
    }

    function hideOtherViews() {
        if (typeof window.hideAllViews === "function") {
            try { window.hideAllViews(); } catch {}
        }
        document.querySelectorAll("#staffPanel > section").forEach(section => {
            if (section.id !== "staffRulesManagerView" && section.id.startsWith("staff")) section.hidden = true;
        });
    }

    function showRulesManager() {
        hideOtherViews();
        const view = document.getElementById("staffRulesManagerView");
        if (view) view.hidden = false;
        const title = document.getElementById("staffPageTitle");
        const description = document.getElementById("staffPageDescription");
        if (title) title.textContent = "Rules Manager";
        if (description) description.textContent = "Add, edit and remove rules from The District rulebook.";
        loadRulebook();
    }

    function wireManager() {
        const nav = document.getElementById("rulesManagerNav");
        if (!nav || nav.dataset.v7Wired === "true") return;
        nav.dataset.v7Wired = "true";

        nav.addEventListener("click", () => {
            document.querySelectorAll(".staff-nav-item").forEach(item => item.classList.toggle("active", item === nav));
            showRulesManager();
        });
        document.getElementById("rulesManagerForm")?.addEventListener("submit", saveRule);
        document.getElementById("rulesManagerNew")?.addEventListener("click", resetForm);
        document.getElementById("rulesManagerRefresh")?.addEventListener("click", loadRulebook);
        document.getElementById("rulesManagerSearch")?.addEventListener("input", renderLibrary);
    }

    function setup(attempt = 0) {
        tidyWikiManager();
        installExactRuleSearch();
        const navReady = ensureRulesManagerNav();
        const viewReady = ensureRulesManagerView();
        if (navReady && viewReady) wireManager();

        if (attempt < 20 && (!navReady || !viewReady || !document.getElementById("wikiManagerNav"))) {
            clearTimeout(setupTimer);
            setupTimer = window.setTimeout(() => setup(attempt + 1), 180);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setup(), { once: true });
    } else {
        setup();
    }
})();
