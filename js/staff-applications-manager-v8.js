/* ==========================================================
   THE DISTRICT — APPLICATION MANAGER V8
   Add, edit and remove public application types and questions.
========================================================== */
(function () {
    const API = "/api/application-manager";
    let applications = null;
    let selectedType = "";
    let setupAttempts = 0;

    const escapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const token = () => localStorage.getItem("district_session") || "";
    const normalise = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

    function ensureNav() {
        if (document.getElementById("applicationManagerNav")) return true;
        const rules = document.getElementById("rulesManagerNav");
        const wiki = document.getElementById("wikiManagerNav");
        const changelog = document.getElementById("changeLogNav");
        const anchor = rules || wiki || changelog;
        const group = anchor?.closest(".staff-nav-group");
        if (!group) return false;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "staff-nav-item";
        button.dataset.view = "application-manager";
        button.id = "applicationManagerNav";
        button.innerHTML = `<span class="staff-nav-content"><span class="staff-nav-icon">AM</span><span>Application Manager</span></span>`;
        anchor.insertAdjacentElement("afterend", button);
        return true;
    }

    function ensureView() {
        const panel = document.getElementById("staffPanel");
        if (!panel) return false;
        if (document.getElementById("staffApplicationManagerView")) return true;

        const view = document.createElement("section");
        view.id = "staffApplicationManagerView";
        view.className = "rules-manager-v6 application-manager-v8";
        view.hidden = true;
        view.innerHTML = `
            <div class="rules-manager-hero">
                <div>
                    <span>APPLICATION CONTROL</span>
                    <h2>Application Manager</h2>
                    <p>Add new application types, edit the questions on existing applications or remove applications from the public recruitment page.</p>
                </div>
                <div class="rules-manager-hero-actions">
                    <a href="/pages/applications.html" target="_blank" rel="noopener" class="discipline-secondary-button">Open Public Applications ↗</a>
                </div>
            </div>

            <div class="rules-manager-layout application-manager-layout">
                <section class="staff-dashboard-panel rules-manager-editor application-manager-editor">
                    <div class="staff-panel-header">
                        <div><span>APPLICATION EDITOR</span><h2 id="applicationManagerHeading">Add an Application</h2><p>Everything here controls what applicants see and which questions they answer.</p></div>
                        <div class="staff-panel-reference"><span>STATUS</span><strong id="applicationManagerStatus">Ready</strong></div>
                    </div>
                    <div class="staff-panel-divider"></div>

                    <form id="applicationManagerForm">
                        <div class="rules-manager-field-grid">
                            <div class="changelog-field full">
                                <label for="applicationManagerType">Application type / internal name</label>
                                <input id="applicationManagerType" maxlength="140" placeholder="e.g. Police Recruitment Application" required>
                                <small>This is also the type used by the application URL and submission system.</small>
                            </div>
                            <div class="changelog-field full">
                                <label for="applicationManagerTitle">Public title</label>
                                <input id="applicationManagerTitle" maxlength="140" placeholder="e.g. Police Recruitment" required>
                            </div>
                            <div class="changelog-field full">
                                <label for="applicationManagerDescription">Description</label>
                                <textarea id="applicationManagerDescription" rows="4" maxlength="1800" required placeholder="Explain what this application is for..."></textarea>
                            </div>
                            <div class="changelog-field">
                                <label for="applicationManagerGroup">Page group</label>
                                <select id="applicationManagerGroup">
                                    <option>Get Started</option>
                                    <option>Community</option>
                                    <option>Media</option>
                                    <option>Development</option>
                                    <option>Command</option>
                                    <option>Businesses</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div class="changelog-field">
                                <label for="applicationManagerCategory">Category label</label>
                                <input id="applicationManagerCategory" maxlength="80" placeholder="e.g. COMMUNITY OPERATIONS">
                            </div>
                            <div class="changelog-field">
                                <label for="applicationManagerIcon">Card icon</label>
                                <input id="applicationManagerIcon" maxlength="4" placeholder="e.g. ST">
                            </div>
                            <label class="application-manager-check">
                                <input id="applicationManagerFeatured" type="checkbox">
                                <span><strong>Featured application</strong><small>Uses the larger application card at the top of the page.</small></span>
                            </label>
                        </div>

                        <div class="application-manager-question-heading">
                            <div><span>FORM QUESTIONS</span><strong>Questions applicants must complete</strong></div>
                            <button type="button" class="discipline-secondary-button" id="applicationManagerAddQuestion">+ Add Question</button>
                        </div>
                        <div id="applicationManagerQuestions" class="application-manager-questions"></div>

                        <div id="applicationManagerMessage" class="changelog-form-message" hidden></div>
                        <div class="rules-manager-form-actions">
                            <button type="button" class="discipline-secondary-button" id="applicationManagerNew">Clear / New Application</button>
                            <button type="submit" class="btn primary" id="applicationManagerSave">Add Application</button>
                        </div>
                    </form>
                </section>

                <aside class="staff-dashboard-panel rules-manager-library application-manager-library">
                    <div class="staff-panel-header rules-manager-library-head">
                        <div><span>CURRENT APPLICATIONS</span><h2>Application Library</h2><p>Select an application to edit its details or questions.</p></div>
                        <button type="button" class="discipline-secondary-button" id="applicationManagerRefresh">Refresh</button>
                    </div>
                    <div class="staff-panel-divider"></div>
                    <div class="rules-manager-search"><span>⌕</span><input id="applicationManagerSearch" type="search" autocomplete="off" placeholder="Whitelist, staff, business..."></div>
                    <div id="applicationManagerLibrary" class="rules-manager-list"></div>
                </aside>
            </div>
        `;
        panel.appendChild(view);
        return true;
    }

    function message(text, type = "info") {
        const el = document.getElementById("applicationManagerMessage");
        if (!el) return;
        el.hidden = !text;
        el.className = `changelog-form-message ${type}`;
        el.textContent = text || "";
    }

    async function request(method = "GET", body = null) {
        const response = await fetch(API, {
            method,
            cache: "no-store",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token()}`,
                ...(body ? { "Content-Type": "application/json" } : {})
            },
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success !== true) throw new Error(data?.error || "Application Manager request failed.");
        return data;
    }

    function questionRow(question = {}) {
        const row = document.createElement("div");
        row.className = "application-manager-question";
        row.innerHTML = `
            <div class="application-manager-question-top">
                <span>QUESTION</span>
                <button type="button" class="application-manager-remove-question" aria-label="Remove question">×</button>
            </div>
            <div class="application-manager-question-grid">
                <div class="changelog-field"><label>Key</label><input data-question-key maxlength="80" value="${escapeHtml(question.key || "")}" placeholder="e.g. experience"></div>
                <div class="changelog-field"><label>Type</label><select data-question-type>
                    ${["textarea", "text", "number", "email", "url"].map(type => `<option value="${type}" ${question.type === type ? "selected" : ""}>${type}</option>`).join("")}
                </select></div>
                <div class="changelog-field full"><label>Question wording</label><textarea data-question-label rows="3" maxlength="1200" placeholder="Write the question applicants will see...">${escapeHtml(question.label || "")}</textarea></div>
                <div class="changelog-field"><label>Minimum characters</label><input data-question-min type="number" min="0" max="5000" value="${Number(question.minimumLength || 0)}"></div>
                <label class="application-manager-check compact"><input data-question-required type="checkbox" ${question.required !== false ? "checked" : ""}><span><strong>Required</strong><small>Applicant must answer it.</small></span></label>
            </div>
        `;
        row.querySelector(".application-manager-remove-question").addEventListener("click", () => {
            row.remove();
            renumberQuestions();
        });
        return row;
    }

    function renumberQuestions() {
        document.querySelectorAll("#applicationManagerQuestions .application-manager-question").forEach((row, index) => {
            const label = row.querySelector(".application-manager-question-top > span");
            if (label) label.textContent = `QUESTION ${String(index + 1).padStart(2, "0")}`;
        });
    }

    function addQuestion(question = {}) {
        const target = document.getElementById("applicationManagerQuestions");
        if (!target) return;
        target.appendChild(questionRow(question));
        renumberQuestions();
    }

    function collectQuestions() {
        return [...document.querySelectorAll("#applicationManagerQuestions .application-manager-question")].map((row, index) => {
            const keyField = row.querySelector("[data-question-key]");
            const label = row.querySelector("[data-question-label]")?.value.trim() || "";
            let key = keyField?.value.trim().replace(/[^A-Za-z0-9_]/g, "") || "";
            if (!key) key = `question${index + 1}`;
            if (keyField) keyField.value = key;
            return {
                key,
                label,
                type: row.querySelector("[data-question-type]")?.value || "textarea",
                required: row.querySelector("[data-question-required]")?.checked !== false,
                minimumLength: Number(row.querySelector("[data-question-min]")?.value || 0) || 0
            };
        });
    }

    function findApplication(type) {
        return (applications || []).find(app => app.application_type === type) || null;
    }

    function renderLibrary() {
        const target = document.getElementById("applicationManagerLibrary");
        if (!target) return;
        if (!Array.isArray(applications)) {
            target.innerHTML = `<div class="member-management-empty"><h3>Open Application Manager to load applications.</h3></div>`;
            return;
        }
        const q = normalise(document.getElementById("applicationManagerSearch")?.value || "");
        const matches = applications.filter(app => !q || normalise(`${app.application_type} ${app.title} ${app.group} ${app.category} ${app.description}`).includes(q));
        if (!matches.length) {
            target.innerHTML = `<div class="member-management-empty"><h3>No matching applications</h3><p>Try a more specific name.</p></div>`;
            return;
        }
        target.innerHTML = matches.map(app => `
            <article class="rules-manager-row ${selectedType === app.application_type ? "selected" : ""}">
                <button type="button" class="rules-manager-row-main" data-app-edit="${escapeHtml(app.application_type)}">
                    <span class="rules-manager-row-id">${escapeHtml(app.icon || "AP")}</span>
                    <span class="rules-manager-row-copy"><strong>${escapeHtml(app.title || app.application_type)}</strong><small>${escapeHtml(app.group || "Application")} · ${(app.questions || []).length} questions</small></span>
                </button>
                <button type="button" class="rules-manager-delete" data-app-delete="${escapeHtml(app.application_type)}" aria-label="Delete application">×</button>
            </article>
        `).join("");
        target.querySelectorAll("[data-app-edit]").forEach(button => button.addEventListener("click", () => editApplication(button.dataset.appEdit)));
        target.querySelectorAll("[data-app-delete]").forEach(button => button.addEventListener("click", () => deleteApplication(button.dataset.appDelete, button)));
    }

    function editApplication(type) {
        const app = findApplication(type);
        if (!app) return;
        selectedType = type;
        const values = {
            applicationManagerType: app.application_type,
            applicationManagerTitle: app.title,
            applicationManagerDescription: app.description,
            applicationManagerGroup: app.group,
            applicationManagerCategory: app.category,
            applicationManagerIcon: app.icon
        };
        Object.entries(values).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) field.value = value ?? "";
        });
        const featured = document.getElementById("applicationManagerFeatured");
        if (featured) featured.checked = app.featured === true;
        const questions = document.getElementById("applicationManagerQuestions");
        if (questions) questions.innerHTML = "";
        (app.questions || []).forEach(addQuestion);
        if (!(app.questions || []).length) addQuestion();
        document.getElementById("applicationManagerHeading").textContent = `Edit ${app.title || type}`;
        document.getElementById("applicationManagerSave").textContent = "Save Application Changes";
        message(`Editing ${type}.`, "info");
        renderLibrary();
        document.querySelector(".application-manager-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetForm() {
        selectedType = "";
        document.getElementById("applicationManagerForm")?.reset();
        const questions = document.getElementById("applicationManagerQuestions");
        if (questions) questions.innerHTML = "";
        addQuestion({ type: "textarea", required: true });
        const heading = document.getElementById("applicationManagerHeading");
        const save = document.getElementById("applicationManagerSave");
        if (heading) heading.textContent = "Add an Application";
        if (save) save.textContent = "Add Application";
        message("");
        renderLibrary();
    }

    function configFromForm() {
        return {
            title: document.getElementById("applicationManagerTitle")?.value.trim() || "",
            description: document.getElementById("applicationManagerDescription")?.value.trim() || "",
            group: document.getElementById("applicationManagerGroup")?.value || "Other",
            category: document.getElementById("applicationManagerCategory")?.value.trim() || "",
            icon: document.getElementById("applicationManagerIcon")?.value.trim().toUpperCase() || "",
            featured: document.getElementById("applicationManagerFeatured")?.checked === true,
            questions: collectQuestions()
        };
    }

    async function loadApplications() {
        const status = document.getElementById("applicationManagerStatus");
        try {
            if (status) status.textContent = "Loading...";
            const data = await request("GET");
            applications = Array.isArray(data.applications) ? data.applications : [];
            renderLibrary();
            if (status) status.textContent = `${applications.length} applications loaded`;
            return applications;
        } catch (error) {
            if (status) status.textContent = "Unavailable";
            const target = document.getElementById("applicationManagerLibrary");
            if (target) target.innerHTML = `<div class="member-management-empty"><h3>Applications unavailable</h3><p>${escapeHtml(error.message)}</p></div>`;
            return null;
        }
    }

    async function saveApplication(event) {
        event.preventDefault();
        const newType = document.getElementById("applicationManagerType")?.value.trim() || "";
        const config = configFromForm();
        if (!newType || !config.title || !config.description) {
            message("Add the application type, public title and description first.", "error");
            return;
        }
        if (!config.questions.length || config.questions.some(question => !question.label)) {
            message("Every application needs at least one properly worded question.", "error");
            return;
        }
        const button = document.getElementById("applicationManagerSave");
        if (button) { button.disabled = true; button.textContent = "Saving..."; }
        try {
            const data = await request("POST", {
                action: selectedType ? "update" : "create",
                application_type: selectedType || undefined,
                new_application_type: newType,
                config
            });
            applications = data.applications || applications;
            selectedType = data.application_type || newType;
            renderLibrary();
            message(data.message || "Application saved.", "success");
            editApplication(selectedType);
        } catch (error) {
            message(error.message || "Unable to save the application.", "error");
        } finally {
            if (button) { button.disabled = false; button.textContent = selectedType ? "Save Application Changes" : "Add Application"; }
        }
    }

    async function deleteApplication(type, button) {
        const app = findApplication(type);
        if (!app || !window.confirm(`Remove ${app.title || type}? Applicants will no longer be able to start this application.`)) return;
        if (button) button.disabled = true;
        try {
            const data = await request("POST", { action: "delete", application_type: type });
            applications = data.applications || applications;
            if (selectedType === type) resetForm();
            renderLibrary();
            message(data.message || `${type} removed.`, "success");
        } catch (error) {
            message(error.message || "Unable to remove the application.", "error");
            if (button) button.disabled = false;
        }
    }

    function showView() {
        if (typeof window.hideAllViews === "function") {
            try { window.hideAllViews(); } catch {}
        }
        document.querySelectorAll("#staffPanel > section").forEach(section => {
            if (section.id !== "staffApplicationManagerView") section.hidden = true;
        });
        const view = document.getElementById("staffApplicationManagerView");
        if (view) view.hidden = false;
        const title = document.getElementById("staffPageTitle");
        const description = document.getElementById("staffPageDescription");
        if (title) title.textContent = "Application Manager";
        if (description) description.textContent = "Add, edit and remove the applications available to the public.";
        loadApplications();
    }

    function wire() {
        const nav = document.getElementById("applicationManagerNav");
        if (!nav || nav.dataset.applicationManagerWired === "true") return;
        nav.dataset.applicationManagerWired = "true";
        nav.addEventListener("click", () => {
            document.querySelectorAll(".staff-nav-item").forEach(item => item.classList.toggle("active", item === nav));
            showView();
        });
        document.getElementById("applicationManagerForm")?.addEventListener("submit", saveApplication);
        document.getElementById("applicationManagerNew")?.addEventListener("click", resetForm);
        document.getElementById("applicationManagerAddQuestion")?.addEventListener("click", () => addQuestion({ type: "textarea", required: true }));
        document.getElementById("applicationManagerRefresh")?.addEventListener("click", loadApplications);
        document.getElementById("applicationManagerSearch")?.addEventListener("input", renderLibrary);

        document.addEventListener("click", event => {
            const item = event.target.closest?.(".staff-nav-item");
            if (item && item !== nav) {
                const view = document.getElementById("staffApplicationManagerView");
                if (view) view.hidden = true;
            }
        });
        resetForm();
    }

    function setup() {
        const ready = ensureNav() && ensureView();
        if (ready) {
            wire();
            return;
        }
        setupAttempts++;
        if (setupAttempts < 40) window.setTimeout(setup, 150);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true });
    else setup();
})();
