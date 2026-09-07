/* ==========================================================
   THE DISTRICT — APPLICATION MANAGEMENT V9
   Reuses the existing Application Management tab and upgrades it
   into a full add/edit/remove application builder.
========================================================== */
(function () {
    const MANAGER_API = "/api/application-manager";
    const STAFF_API = "https://the-district-api.danielclifford2808.workers.dev";

    let applications = [];
    let availability = new Map();
    let selectedType = "";
    let attempts = 0;

    const token = () => localStorage.getItem("district_session") || "";
    const escapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    const normalise = value => String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    function managerRequest(method = "GET", body = null) {
        return fetch(MANAGER_API, {
            method,
            cache: "no-store",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token()}`,
                ...(body ? { "Content-Type": "application/json" } : {})
            },
            body: body ? JSON.stringify(body) : undefined
        }).then(async response => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data?.success !== true) {
                throw new Error(data?.error || "Application Management request failed.");
            }
            return data;
        });
    }

    function availabilityRequest(method = "GET", body = null) {
        return fetch(`${STAFF_API}/api/staff/applications/availability`, {
            method,
            cache: "no-store",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token()}`
            },
            body: body ? JSON.stringify(body) : undefined
        }).then(async response => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data?.success !== true) {
                throw new Error(data?.error || "Application availability request failed.");
            }
            return data;
        });
    }

    function statusLabel(status) {
        const value = String(status || "open").toLowerCase();
        if (value === "temporarily_closed") return "Temporarily Closed";
        if (value === "closed") return "Closed";
        return "Open";
    }

    function ensureExistingNav() {
        let nav = document.getElementById("applicationManagementNav");
        if (!nav) return false;

        /* Remove the legacy click handler cleanly by replacing the node. */
        if (nav.dataset.managerV9 !== "true") {
            const clone = nav.cloneNode(true);
            clone.dataset.managerV9 = "true";
            clone.dataset.view = "application-management";
            const text = clone.querySelector(".staff-nav-content > span:last-child");
            if (text) text.textContent = "Application Management";
            nav.replaceWith(clone);
            nav = clone;
        }
        return true;
    }

    function ensureView() {
        const view = document.getElementById("applicationManagementView");
        if (!view) return false;
        if (view.dataset.managerV9 === "true") return true;

        view.dataset.managerV9 = "true";
        view.className = "rules-manager-v6 application-manager-v8";
        view.hidden = true;
        view.innerHTML = `
            <div class="rules-manager-hero">
                <div>
                    <span>RECRUITMENT CONTROL</span>
                    <h2>Application Management</h2>
                    <p>Add, edit, remove and open or close every application available on The District website.</p>
                </div>
                <div class="rules-manager-hero-actions">
                    <a href="/pages/applications.html" target="_blank" rel="noopener" class="discipline-secondary-button">Open Public Applications ↗</a>
                </div>
            </div>

            <div class="rules-manager-layout application-manager-layout">
                <section class="staff-dashboard-panel rules-manager-editor application-manager-editor">
                    <div class="staff-panel-header">
                        <div>
                            <span>APPLICATION EDITOR</span>
                            <h2 id="applicationManagerHeading">Add an Application</h2>
                            <p>Change the card information and the exact questions applicants complete.</p>
                        </div>
                        <div class="staff-panel-reference"><span>STATUS</span><strong id="applicationManagerStatus">Ready</strong></div>
                    </div>
                    <div class="staff-panel-divider"></div>

                    <form id="applicationManagerForm">
                        <div class="rules-manager-field-grid">
                            <div class="changelog-field full">
                                <label for="applicationManagerType">Application type / internal name</label>
                                <input id="applicationManagerType" maxlength="140" placeholder="e.g. Police Recruitment Application" required>
                                <small>This exact name is used by the application link and submission queue.</small>
                            </div>

                            <div class="changelog-field full">
                                <label for="applicationManagerTitle">Public title</label>
                                <input id="applicationManagerTitle" maxlength="140" placeholder="e.g. Police Recruitment" required>
                            </div>

                            <div class="changelog-field full">
                                <label for="applicationManagerDescription">Public description</label>
                                <textarea id="applicationManagerDescription" rows="4" maxlength="1800" required placeholder="Explain what this application is for..."></textarea>
                            </div>

                            <div class="changelog-field">
                                <label for="applicationManagerGroup">Applications page section</label>
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
                                <label for="applicationManagerCategory">Small category label</label>
                                <input id="applicationManagerCategory" maxlength="80" placeholder="e.g. COMMUNITY OPERATIONS">
                            </div>

                            <div class="changelog-field">
                                <label for="applicationManagerIcon">Card icon</label>
                                <input id="applicationManagerIcon" maxlength="4" placeholder="e.g. ST">
                            </div>

                            <div class="changelog-field">
                                <label for="applicationManagerAvailability">Recruitment status</label>
                                <select id="applicationManagerAvailability">
                                    <option value="open">Open</option>
                                    <option value="temporarily_closed">Temporarily Closed</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <label class="application-manager-check full">
                                <input id="applicationManagerFeatured" type="checkbox">
                                <span><strong>Featured application</strong><small>Show this as the larger main card at the top of the Applications page.</small></span>
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
                        <div>
                            <span>CURRENT APPLICATIONS</span>
                            <h2>Application Library</h2>
                            <p>Every application currently published on the website is listed here.</p>
                        </div>
                        <button type="button" class="discipline-secondary-button" id="applicationManagerRefresh">Refresh</button>
                    </div>
                    <div class="staff-panel-divider"></div>
                    <div class="rules-manager-search"><span>⌕</span><input id="applicationManagerSearch" type="search" autocomplete="off" placeholder="Whitelist, staff, business..."></div>
                    <div id="applicationManagerLibrary" class="rules-manager-list"></div>
                </aside>
            </div>
        `;
        return true;
    }

    function showMessage(text, type = "info") {
        const el = document.getElementById("applicationManagerMessage");
        if (!el) return;
        el.hidden = !text;
        el.className = `changelog-form-message ${type}`;
        el.textContent = text || "";
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
                <div class="changelog-field">
                    <label>Key</label>
                    <input data-question-key maxlength="80" value="${escapeHtml(question.key || "")}" placeholder="e.g. experience">
                </div>
                <div class="changelog-field">
                    <label>Answer type</label>
                    <select data-question-type>
                        ${["textarea", "text", "number", "email", "url"].map(type => `<option value="${type}" ${question.type === type ? "selected" : ""}>${type}</option>`).join("")}
                    </select>
                </div>
                <div class="changelog-field full">
                    <label>Question wording</label>
                    <textarea data-question-label rows="3" maxlength="1200" placeholder="Write the exact question applicants will see...">${escapeHtml(question.label || "")}</textarea>
                </div>
                <div class="changelog-field">
                    <label>Minimum characters</label>
                    <input data-question-min type="number" min="0" max="5000" value="${Number(question.minimumLength || 0)}">
                </div>
                <label class="application-manager-check compact">
                    <input data-question-required type="checkbox" ${question.required !== false ? "checked" : ""}>
                    <span><strong>Required</strong><small>The applicant must answer it.</small></span>
                </label>
            </div>
        `;
        row.querySelector(".application-manager-remove-question")?.addEventListener("click", () => {
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
            const keyInput = row.querySelector("[data-question-key]");
            let key = keyInput?.value.trim().replace(/[^A-Za-z0-9_]/g, "") || `question${index + 1}`;
            if (keyInput) keyInput.value = key;
            return {
                key,
                label: row.querySelector("[data-question-label]")?.value.trim() || "",
                type: row.querySelector("[data-question-type]")?.value || "textarea",
                required: row.querySelector("[data-question-required]")?.checked !== false,
                minimumLength: Number(row.querySelector("[data-question-min]")?.value || 0) || 0
            };
        });
    }

    function appByType(type) {
        return applications.find(app => app.application_type === type) || null;
    }

    function renderLibrary() {
        const target = document.getElementById("applicationManagerLibrary");
        if (!target) return;
        const q = normalise(document.getElementById("applicationManagerSearch")?.value || "");
        const matches = applications.filter(app => {
            if (!q) return true;
            return normalise(`${app.application_type} ${app.title} ${app.group} ${app.category} ${app.description}`).includes(q);
        });

        if (!matches.length) {
            target.innerHTML = `<div class="member-management-empty"><h3>No matching applications</h3><p>Try an application name or category.</p></div>`;
            return;
        }

        target.innerHTML = matches.map(app => {
            const status = availability.get(app.application_type) || "open";
            return `
                <article class="rules-manager-row ${selectedType === app.application_type ? "selected" : ""}">
                    <button type="button" class="rules-manager-row-main" data-app-edit="${escapeHtml(app.application_type)}">
                        <span class="rules-manager-row-id">${escapeHtml(app.icon || "AP")}</span>
                        <span class="rules-manager-row-copy">
                            <strong>${escapeHtml(app.title || app.application_type)}</strong>
                            <small>${escapeHtml(app.group || "Application")} · ${(app.questions || []).length} questions · ${escapeHtml(statusLabel(status))}</small>
                        </span>
                    </button>
                    <button type="button" class="rules-manager-delete" data-app-delete="${escapeHtml(app.application_type)}" aria-label="Delete application">×</button>
                </article>
            `;
        }).join("");

        target.querySelectorAll("[data-app-edit]").forEach(button => {
            button.addEventListener("click", () => editApplication(button.dataset.appEdit));
        });
        target.querySelectorAll("[data-app-delete]").forEach(button => {
            button.addEventListener("click", () => deleteApplication(button.dataset.appDelete, button));
        });
    }

    function editApplication(type) {
        const app = appByType(type);
        if (!app) return;
        selectedType = type;

        const values = {
            applicationManagerType: app.application_type,
            applicationManagerTitle: app.title,
            applicationManagerDescription: app.description,
            applicationManagerGroup: app.group,
            applicationManagerCategory: app.category,
            applicationManagerIcon: app.icon,
            applicationManagerAvailability: availability.get(type) || "open"
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
        if (!(app.questions || []).length) addQuestion({ type: "textarea", required: true });

        const heading = document.getElementById("applicationManagerHeading");
        const save = document.getElementById("applicationManagerSave");
        if (heading) heading.textContent = `Edit ${app.title || type}`;
        if (save) save.textContent = "Save Application Changes";
        showMessage(`Editing ${type}.`, "info");
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
        showMessage("");
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

    function queueBadgeId(type, index) {
        return `nav-count-managed-${index}-${normalise(type).replace(/\s+/g, "-").slice(0, 28)}`;
    }

    function syncReviewQueues() {
        const dropdown = document.querySelector(".staff-nav-dropdown-content");
        if (!dropdown || !applications.length) return;

        try {
            if (typeof APPLICATION_TYPES !== "undefined" && Array.isArray(APPLICATION_TYPES)) {
                APPLICATION_TYPES.splice(0, APPLICATION_TYPES.length, ...applications.map(app => app.application_type));
            }
            if (typeof APPLICATION_BADGES !== "undefined" && APPLICATION_BADGES) {
                Object.keys(APPLICATION_BADGES).forEach(key => delete APPLICATION_BADGES[key]);
            }
        } catch (error) {
            console.warn("Unable to sync staff application arrays:", error);
        }

        dropdown.innerHTML = applications.map((app, index) => {
            const badgeId = queueBadgeId(app.application_type, index);
            try {
                if (typeof APPLICATION_BADGES !== "undefined" && APPLICATION_BADGES) {
                    APPLICATION_BADGES[app.application_type] = badgeId;
                }
            } catch {}
            return `
                <button type="button" class="staff-nav-item staff-nav-subitem" data-type="${escapeHtml(app.application_type)}">
                    <span class="staff-nav-content"><span class="staff-nav-icon">${escapeHtml(app.icon || "AP")}</span><span>${escapeHtml(app.title || app.application_type.replace(" Application", ""))}</span></span>
                    <span class="staff-nav-badge" id="${escapeHtml(badgeId)}">0</span>
                </button>
            `;
        }).join("");

        dropdown.querySelectorAll(".staff-nav-item[data-type]").forEach(button => {
            button.addEventListener("click", async () => {
                try {
                    if (typeof setActiveNav === "function") setActiveNav(button);
                    if (typeof currentStatusFilter !== "undefined") currentStatusFilter = "pending";
                    if (typeof resetStatusButtons === "function") resetStatusButtons();
                    if (typeof openQueue === "function") await openQueue(button.dataset.type);
                } catch (error) {
                    console.error("Unable to open application queue:", error);
                }
            });
        });

        try {
            if (typeof loadApplicationOverview === "function") loadApplicationOverview();
        } catch {}
    }

    async function loadApplications() {
        const status = document.getElementById("applicationManagerStatus");
        if (status) status.textContent = "Loading...";
        try {
            const [managerData, availabilityData] = await Promise.all([
                managerRequest("GET"),
                availabilityRequest("GET").catch(error => {
                    console.warn("Availability could not be loaded:", error);
                    return { applications: [] };
                })
            ]);
            applications = Array.isArray(managerData.applications) ? managerData.applications : [];
            availability = new Map((availabilityData.applications || []).map(row => [row.application_type, String(row.status || "open").toLowerCase()]));
            renderLibrary();
            syncReviewQueues();
            if (status) status.textContent = `${applications.length} applications loaded`;
            return applications;
        } catch (error) {
            if (status) status.textContent = "Unavailable";
            const target = document.getElementById("applicationManagerLibrary");
            if (target) target.innerHTML = `<div class="member-management-empty"><h3>Applications unavailable</h3><p>${escapeHtml(error.message)}</p></div>`;
            return null;
        }
    }

    async function saveAvailability(type, status) {
        if (!type || !status) return;
        try {
            await availabilityRequest("PATCH", { application_type: type, status });
            availability.set(type, status);
        } catch (error) {
            /* A brand-new app may not yet exist in the separate Worker availability table. */
            console.warn(`Unable to update availability for ${type}:`, error);
            throw error;
        }
    }

    async function saveApplication(event) {
        event.preventDefault();
        const newType = document.getElementById("applicationManagerType")?.value.trim() || "";
        const desiredStatus = document.getElementById("applicationManagerAvailability")?.value || "open";
        const config = configFromForm();

        if (!newType || !config.title || !config.description) {
            showMessage("Add the application type, public title and description first.", "error");
            return;
        }
        if (!config.questions.length || config.questions.some(question => !question.label)) {
            showMessage("Every application needs at least one properly worded question.", "error");
            return;
        }

        const button = document.getElementById("applicationManagerSave");
        if (button) { button.disabled = true; button.textContent = "Saving..."; }

        try {
            const data = await managerRequest("POST", {
                action: selectedType ? "update" : "create",
                application_type: selectedType || undefined,
                new_application_type: newType,
                config
            });
            applications = Array.isArray(data.applications) ? data.applications : applications;
            const oldType = selectedType;
            selectedType = data.application_type || newType;

            if (oldType && oldType !== selectedType) availability.delete(oldType);
            let availabilityWarning = "";
            try {
                await saveAvailability(selectedType, desiredStatus);
            } catch {
                availability.set(selectedType, desiredStatus);
                availabilityWarning = " The application was saved, but the separate availability service did not accept the new type yet.";
            }

            syncReviewQueues();
            renderLibrary();
            editApplication(selectedType);
            showMessage(`${data.message || "Application saved."}${availabilityWarning}`, availabilityWarning ? "info" : "success");
        } catch (error) {
            showMessage(error.message || "Unable to save the application.", "error");
        } finally {
            if (button) { button.disabled = false; button.textContent = selectedType ? "Save Application Changes" : "Add Application"; }
        }
    }

    async function deleteApplication(type, button) {
        const app = appByType(type);
        if (!app || !window.confirm(`Remove ${app.title || type}? It will disappear from the public Applications page.`)) return;
        if (button) button.disabled = true;
        try {
            const data = await managerRequest("POST", { action: "delete", application_type: type });
            applications = Array.isArray(data.applications) ? data.applications : applications.filter(app => app.application_type !== type);
            availability.delete(type);
            if (selectedType === type) resetForm();
            syncReviewQueues();
            renderLibrary();
            showMessage(data.message || `${type} removed.`, "success");
        } catch (error) {
            showMessage(error.message || "Unable to remove the application.", "error");
            if (button) button.disabled = false;
        }
    }

    function showManager() {
        try {
            if (typeof hideAllViews === "function") hideAllViews();
        } catch {}
        const view = document.getElementById("applicationManagementView");
        if (view) view.hidden = false;
        const title = document.getElementById("staffPageTitle");
        const description = document.getElementById("staffPageDescription");
        if (title) title.textContent = "Application Management";
        if (description) description.textContent = "Add, edit, remove and control all public applications.";
        try {
            if (typeof setTopSearch === "function") setTopSearch("", false);
        } catch {}
        loadApplications();
    }

    function wire() {
        const nav = document.getElementById("applicationManagementNav");
        if (!nav || nav.dataset.managerV9Wired === "true") return false;
        nav.dataset.managerV9Wired = "true";
        nav.addEventListener("click", () => {
            try { if (typeof setActiveNav === "function") setActiveNav(nav); } catch {}
            showManager();
        });

        document.getElementById("applicationManagerForm")?.addEventListener("submit", saveApplication);
        document.getElementById("applicationManagerNew")?.addEventListener("click", resetForm);
        document.getElementById("applicationManagerAddQuestion")?.addEventListener("click", () => addQuestion({ type: "textarea", required: true }));
        document.getElementById("applicationManagerRefresh")?.addEventListener("click", loadApplications);
        document.getElementById("applicationManagerSearch")?.addEventListener("input", renderLibrary);
        resetForm();
        return true;
    }

    function setup() {
        if (ensureExistingNav() && ensureView() && wire()) {
            loadApplications();
            return;
        }
        attempts++;
        if (attempts < 40) window.setTimeout(setup, 150);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
        setup();
    }
})();
