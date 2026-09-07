/* ==========================================================
   THE DISTRICT — STAFF CONTENT MANAGEMENT V6
   - removes the Wiki NEW badge
   - labels the Wiki Manager as the full Wiki library
   - adds a Rules Manager with add/edit/remove controls
   - tightens Rule Search so it returns fewer, more exact matches
========================================================== */
(function () {
    const RULES_API = "/api/rules-manager";
    let managedRulebook = null;
    let selectedRuleId = "";

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function token() {
        return localStorage.getItem("district_session") || "";
    }

    function normalise(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9.]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function flattenRulebook(rulebook = managedRulebook) {
        if (!Array.isArray(rulebook)) return [];
        return rulebook.flatMap(section =>
            (Array.isArray(section.rules) ? section.rules : []).map(rule => ({
                ...rule,
                sectionNumber: section.number,
                sectionTitle: section.title,
                sectionDescription: section.description
            }))
        );
    }

    function strictRuleMatches(incident) {
        const query = normalise(incident);
        if (query.length < 3) return [];

        let rules = flattenRulebook();
        if (!rules.length && typeof window.flattenedRulebook === "function") {
            try { rules = window.flattenedRulebook() || []; } catch { rules = []; }
        }
        if (!rules.length) return [];

        const idQuery = query.replace(/\s+/g, "");
        const exactId = rules.find(rule => normalise(rule.id).replace(/\s+/g, "") === idQuery);
        if (exactId) {
            return [{ rule: exactId, score: 999, reasons: ["Exact rule ID"] }];
        }

        const exactTitle = rules.filter(rule => {
            const title = normalise(rule.title);
            return title && (query === title || query.includes(title));
        });
        if (exactTitle.length === 1) {
            return [{ rule: exactTitle[0], score: 940, reasons: ["Exact rule title"] }];
        }

        const scored = rules.map(rule => {
            if (typeof window.scoreRuleSearchMatch === "function") {
                try { return window.scoreRuleSearchMatch(rule, incident); } catch {}
            }

            const text = normalise([
                rule.id,
                rule.title,
                rule.punishment,
                rule.description,
                rule.enforcement,
                rule.sectionTitle
            ].join(" "));
            const terms = query.split(" ").filter(word => word.length >= 4);
            const hits = terms.filter(word => text.split(" ").includes(word)).length;
            return {
                rule,
                score: hits * 10,
                reasons: hits ? [`${hits} exact keyword match${hits === 1 ? "" : "es"}`] : []
            };
        }).filter(result => result && Number(result.score) > 0)
          .sort((a, b) => b.score - a.score);

        if (!scored.length) return [];
        const best = scored[0].score;
        if (best < 38) return [];

        const minimum = best >= 120
            ? Math.max(72, best * 0.62)
            : best >= 80
                ? Math.max(58, best * 0.70)
                : Math.max(42, best * 0.78);

        return scored
            .filter((result, index) => index === 0 || result.score >= minimum)
            .slice(0, 3);
    }

    function installExactRuleSearch() {
        if (typeof window.findPossibleRuleBreaches !== "function") return;
        window.findPossibleRuleBreaches = strictRuleMatches;
    }

    function cleanWikiManagerChrome() {
        document.querySelectorAll(".v3-nav-new").forEach(node => node.remove());

        const library = document.querySelector(".v3-wiki-library-panel .staff-panel-header > div");
        if (library) {
            const label = library.querySelector("span");
            const title = library.querySelector("h2");
            const description = library.querySelector("p");
            if (label) label.textContent = "ALL PUBLIC WIKI ARTICLES";
            if (title) title.textContent = "Wiki Library";
            if (description) description.textContent = "Edit or remove any guide that is currently available on the public Wiki.";
        }

        const formTitle = document.getElementById("wikiManagerFormTitle");
        if (formTitle && formTitle.textContent.trim() === "New Wiki Article") {
            formTitle.textContent = "Wiki Article Editor";
        }
    }

    function ensureRulesManagerNav() {
        if (!document.getElementById("staffPanel") || document.getElementById("rulesManagerNav")) return false;

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

        if (wiki) wiki.insertAdjacentElement("afterend", button);
        else if (changelog) changelog.insertAdjacentElement("afterend", button);
        else group.appendChild(button);

        return true;
    }

    function ensureRulesManagerView() {
        const panel = document.getElementById("staffPanel");
        if (!panel || document.getElementById("staffRulesManagerView")) return false;

        const view = document.createElement("section");
        view.id = "staffRulesManagerView";
        view.className = "rules-manager-v6";
        view.hidden = true;
        view.innerHTML = `
            <div class="rules-manager-hero">
                <div>
                    <span>RULEBOOK CONTROL / LIVE WEBSITE CONTENT</span>
                    <h2>Rules Manager</h2>
                    <p>Add, edit and remove rules without opening the source files. Rule IDs stay tied to their selected section.</p>
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
                            <p>Select a section, write the rule and publish it to the rulebook.</p>
                        </div>
                        <div class="staff-panel-reference"><span>STATUS</span><strong id="rulesManagerStatus">Loading rulebook...</strong></div>
                    </div>
                    <div class="staff-panel-divider"></div>

                    <form id="rulesManagerForm" class="rules-manager-form">
                        <div class="rules-manager-field-grid">
                            <div class="changelog-field">
                                <label for="rulesManagerSection">Section</label>
                                <select id="rulesManagerSection" required></select>
                            </div>
                            <div class="changelog-field">
                                <label for="rulesManagerId">Rule ID</label>
                                <input id="rulesManagerId" maxlength="30" placeholder="Auto, e.g. 02.16">
                                <small>Leave blank when adding a rule and the next ID is generated automatically.</small>
                            </div>
                            <div class="changelog-field full">
                                <label for="rulesManagerTitle">Rule title</label>
                                <input id="rulesManagerTitle" maxlength="140" placeholder="e.g. Combat Logging" required>
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
                                <textarea id="rulesManagerDescription" rows="5" maxlength="1800" placeholder="Write the exact rule players will read..." required></textarea>
                            </div>
                            <div class="changelog-field full">
                                <label for="rulesManagerEnforcement">Enforcement guidance</label>
                                <textarea id="rulesManagerEnforcement" rows="4" maxlength="1800" placeholder="Explain the normal enforcement approach..."></textarea>
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
                        <div>
                            <span>CURRENT RULEBOOK</span>
                            <h2>Rules</h2>
                            <p>Search by exact rule ID, title or wording.</p>
                        </div>
                        <button type="button" class="discipline-secondary-button" id="rulesManagerRefresh">Refresh</button>
                    </div>
                    <div class="staff-panel-divider"></div>
                    <div class="rules-manager-search"><span>⌕</span><input id="rulesManagerSearch" type="search" autocomplete="off" placeholder="02.4, RDM, combat logging..."></div>
                    <div id="rulesManagerLibrary" class="rules-manager-list"><div class="member-management-empty"><h3>Loading rules...</h3></div></div>
                </aside>
            </div>
        `;

        panel.appendChild(view);
        return true;
    }

    function showMessage(text, type = "info") {
        const message = document.getElementById("rulesManagerMessage");
        if (!message) return;
        message.hidden = !text;
        message.className = `changelog-form-message ${type}`;
        message.textContent = text || "";
    }

    function fillSectionSelect() {
        const select = document.getElementById("rulesManagerSection");
        if (!select || !Array.isArray(managedRulebook)) return;
        const current = select.value;
        select.innerHTML = managedRulebook.map(section => `
            <option value="${escapeHtml(section.number)}">${escapeHtml(section.number)} — ${escapeHtml(section.title)}</option>
        `).join("");
        if ([...select.options].some(option => option.value === current)) select.value = current;
    }

    function renderRulesLibrary() {
        const target = document.getElementById("rulesManagerLibrary");
        const search = document.getElementById("rulesManagerSearch");
        if (!target || !Array.isArray(managedRulebook)) return;

        const q = normalise(search?.value || "");
        const groups = managedRulebook.map(section => {
            const matches = (section.rules || []).filter(rule => {
                if (!q) return true;
                const id = normalise(rule.id);
                const title = normalise(rule.title);
                const text = normalise(`${rule.id} ${rule.title} ${rule.punishment} ${rule.description} ${rule.enforcement}`);
                if (q === id || q === title) return true;
                const tokens = q.split(" ").filter(Boolean);
                return tokens.every(token => text.includes(token));
            });
            return { section, matches };
        }).filter(group => group.matches.length);

        if (!groups.length) {
            target.innerHTML = `<div class="member-management-empty"><div class="member-empty-icon">RL</div><h3>No exact rules found</h3><p>Try a rule ID such as 02.4, or a more specific title/phrase.</p></div>`;
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
                        <button type="button" class="rules-manager-delete" data-rules-delete="${escapeHtml(rule.id)}" aria-label="Delete ${escapeHtml(rule.id)}">×</button>
                    </article>
                `).join("")}
            </section>
        `).join("");

        target.querySelectorAll("[data-rules-edit]").forEach(button => {
            button.addEventListener("click", () => editRule(button.dataset.rulesEdit));
        });
        target.querySelectorAll("[data-rules-delete]").forEach(button => {
            button.addEventListener("click", () => deleteRule(button.dataset.rulesDelete, button));
        });
    }

    function findRuleById(id) {
        for (const section of managedRulebook || []) {
            const rule = (section.rules || []).find(item => item.id === id);
            if (rule) return { section, rule };
        }
        return null;
    }

    function editRule(id) {
        const found = findRuleById(id);
        if (!found) return;
        selectedRuleId = id;

        const set = (fieldId, value) => {
            const field = document.getElementById(fieldId);
            if (field) field.value = value ?? "";
        };
        set("rulesManagerSection", found.section.number);
        set("rulesManagerId", found.rule.id);
        set("rulesManagerTitle", found.rule.title);
        set("rulesManagerPunishment", found.rule.punishment);
        set("rulesManagerDescription", found.rule.description);
        set("rulesManagerEnforcement", found.rule.enforcement);

        const heading = document.getElementById("rulesManagerHeading");
        const save = document.getElementById("rulesManagerSave");
        if (heading) heading.textContent = `Edit ${found.rule.id}`;
        if (save) save.textContent = "Save Rule Changes";
        showMessage(`Editing ${found.rule.id}. Save changes when ready.`, "info");
        renderRulesLibrary();
        document.querySelector(".rules-manager-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetRuleForm() {
        selectedRuleId = "";
        document.getElementById("rulesManagerForm")?.reset();
        fillSectionSelect();
        const heading = document.getElementById("rulesManagerHeading");
        const save = document.getElementById("rulesManagerSave");
        if (heading) heading.textContent = "Add a Rule";
        if (save) save.textContent = "Add Rule";
        showMessage("");
        renderRulesLibrary();
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

    async function rulesRequest(method = "GET", body = null) {
        const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`
        };
        if (body) headers["Content-Type"] = "application/json";

        const response = await fetch(RULES_API, {
            method,
            headers,
            cache: "no-store",
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success !== true) throw new Error(data?.error || "Rules manager request failed.");
        return data;
    }

    async function loadRulebook(render = true) {
        const status = document.getElementById("rulesManagerStatus");
        try {
            if (status) status.textContent = "Loading...";
            const data = await rulesRequest("GET");
            managedRulebook = Array.isArray(data.rulebook) ? data.rulebook : [];
            window.__districtManagedRulebook = managedRulebook;
            installExactRuleSearch();
            fillSectionSelect();
            if (render) renderRulesLibrary();
            if (status) status.textContent = `${data.rules || flattenRulebook().length} rules loaded`;
            return managedRulebook;
        } catch (error) {
            if (status) status.textContent = "Rulebook unavailable";
            if (render) {
                const target = document.getElementById("rulesManagerLibrary");
                if (target) target.innerHTML = `<div class="member-management-empty"><h3>Rules unavailable</h3><p>${escapeHtml(error.message)}</p></div>`;
            }
            return null;
        }
    }

    async function saveRule(event) {
        event.preventDefault();
        const sectionNumber = document.getElementById("rulesManagerSection")?.value || "";
        const rule = ruleFromForm();
        const button = document.getElementById("rulesManagerSave");

        if (!rule.title || !rule.description) {
            showMessage("Add a rule title and the rule wording first.", "error");
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = selectedRuleId ? "Saving..." : "Adding...";
        }

        try {
            const data = await rulesRequest("POST", {
                action: selectedRuleId ? "update" : "create",
                id: selectedRuleId || undefined,
                section_number: sectionNumber,
                rule
            });
            managedRulebook = data.rulebook || managedRulebook;
            window.__districtManagedRulebook = managedRulebook;
            installExactRuleSearch();
            fillSectionSelect();
            renderRulesLibrary();
            showMessage(data.message || "Rulebook updated. A new website deployment will publish the change.", "success");
            selectedRuleId = data.rule?.id || selectedRuleId;
            if (data.rule?.id) editRule(data.rule.id);
        } catch (error) {
            showMessage(error.message || "Unable to save the rule.", "error");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = selectedRuleId ? "Save Rule Changes" : "Add Rule";
            }
        }
    }

    async function deleteRule(id, button) {
        const found = findRuleById(id);
        if (!found || !window.confirm(`Remove rule ${id} — ${found.rule.title}?`)) return;
        if (button) button.disabled = true;

        try {
            const data = await rulesRequest("POST", { action: "delete", id });
            managedRulebook = data.rulebook || managedRulebook;
            window.__districtManagedRulebook = managedRulebook;
            installExactRuleSearch();
            if (selectedRuleId === id) resetRuleForm();
            renderRulesLibrary();
            showMessage(data.message || `Rule ${id} removed.`, "success");
        } catch (error) {
            showMessage(error.message || "Unable to remove the rule.", "error");
            if (button) button.disabled = false;
        }
    }

    function showRulesManager() {
        if (typeof window.hideAllViews === "function") {
            try { window.hideAllViews(); } catch {}
        }
        document.querySelectorAll("#staffPanel > section").forEach(section => {
            if (section.id !== "staffRulesManagerView" && section.id.startsWith("staff")) {
                section.hidden = true;
            }
        });
        const view = document.getElementById("staffRulesManagerView");
        if (view) view.hidden = false;

        const title = document.getElementById("staffPageTitle");
        const description = document.getElementById("staffPageDescription");
        if (title) title.textContent = "Rules Manager";
        if (description) description.textContent = "Add, edit and remove rules from The District rulebook.";

        loadRulebook();
    }

    function wireRulesManager() {
        const nav = document.getElementById("rulesManagerNav");
        if (!nav || nav.dataset.rulesManagerWired === "true") return;
        nav.dataset.rulesManagerWired = "true";
        nav.addEventListener("click", () => {
            document.querySelectorAll(".staff-nav-item").forEach(item => item.classList.toggle("active", item === nav));
            showRulesManager();
        });

        document.getElementById("rulesManagerForm")?.addEventListener("submit", saveRule);
        document.getElementById("rulesManagerNew")?.addEventListener("click", resetRuleForm);
        document.getElementById("rulesManagerRefresh")?.addEventListener("click", () => loadRulebook());
        document.getElementById("rulesManagerSearch")?.addEventListener("input", renderRulesLibrary);

        document.addEventListener("click", event => {
            const item = event.target.closest?.(".staff-nav-item");
            if (item && item !== nav) {
                const view = document.getElementById("staffRulesManagerView");
                if (view) view.hidden = true;
            }
        });
    }

    function setup(attempt = 0) {
        cleanWikiManagerChrome();
        ensureRulesManagerNav();
        ensureRulesManagerView();
        wireRulesManager();
        installExactRuleSearch();

        if (document.getElementById("staffPanel")) {
            loadRulebook(false);
        }

        if (attempt < 35 && (!document.getElementById("rulesManagerNav") || !document.getElementById("wikiManagerNav"))) {
            window.setTimeout(() => setup(attempt + 1), 120);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setup(), { once: true });
    } else {
        setup();
    }

    const observer = new MutationObserver(() => cleanWikiManagerChrome());
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
