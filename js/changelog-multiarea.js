/* ==========================================================
   THE DISTRICT — MULTI-AREA CHANGE LOG EDITOR
========================================================== */
(function () {
    const DRAFT_KEY = "district_staff_changelog_multiarea_v1";
    const GENERAL_FIELDS = [
        "changeLogTitle",
        "changeLogVersion",
        "changeLogEnvironment",
        "changeLogDeveloperLevel",
        "changeLogType",
        "changeLogSummary",
        "changeLogKnownIssues"
    ];

    const AREAS = {
        game: {
            label: "Game / Server",
            title: "The District Development Update",
            environment: "Live Server",
            fields: {
                added: "Added to game",
                removed: "Removed from game",
                changed: "Changed in game",
                fixed: "Fixed in game"
            },
            placeholders: {
                added: "New phone system\nNew business interiors\nNew police equipment",
                removed: "Old phone\nLegacy police job",
                changed: "Updated vehicle handling\nChanged job permissions",
                fixed: "Fixed phone listing bug\nFixed vehicle garage issue"
            }
        },
        website: {
            label: "Website",
            title: "The District Website Update",
            environment: "Website / Services",
            fields: {
                added: "Added to website",
                removed: "Removed from website",
                changed: "Changed in website",
                fixed: "Fixed in website"
            },
            placeholders: {
                added: "New Wiki Manager\nNew homepage section",
                removed: "Old landing section\nUnused page",
                changed: "Redesigned homepage\nUpdated application flow",
                fixed: "Fixed mobile navigation\nFixed Discord login redirect"
            }
        },
        discord: {
            label: "Discord",
            title: "The District Discord Update",
            environment: "Discord / Community",
            fields: {
                added: "Added to Discord",
                removed: "Removed from Discord",
                changed: "Changed in Discord",
                fixed: "Fixed in Discord"
            },
            placeholders: {
                added: "New ticket category\nNew staff command",
                removed: "Old ticket panel\nUnused command",
                changed: "Updated role permissions\nChanged ticket workflow",
                fixed: "Fixed role assignment\nFixed notification formatting"
            }
        },
        backend: {
            label: "Backend / API",
            title: "The District Systems Update",
            environment: "Backend Services",
            fields: {
                added: "Added to backend",
                removed: "Removed from backend",
                changed: "Changed in backend",
                fixed: "Fixed in backend"
            },
            placeholders: {
                added: "New API route\nNew database table",
                removed: "Deprecated API route\nOld handler",
                changed: "Updated authentication flow\nImproved caching",
                fixed: "Fixed API response error\nFixed database query"
            }
        },
        scripts: {
            label: "Scripts / Systems",
            title: "The District Script Update",
            environment: "Live Server",
            fields: {
                added: "Scripts added",
                removed: "Scripts removed",
                changed: "Scripts changed",
                fixed: "Script fixes"
            },
            placeholders: {
                added: "New banking resource\nNew interaction system",
                removed: "Old resource\nUnused dependency",
                changed: "Updated police resource\nChanged inventory integration",
                fixed: "Fixed script error\nFixed resource conflict"
            }
        },
        phone: {
            label: "Phone System",
            title: "The District Phone Update",
            environment: "Live Server",
            fields: {
                added: "Added to phone",
                removed: "Removed from phone",
                changed: "Changed in phone",
                fixed: "Fixed in phone"
            },
            placeholders: {
                added: "New app\nNew first-time setup",
                removed: "Old app\nUnused phone setting",
                changed: "Redesigned home screen\nUpdated app store",
                fixed: "Fixed keyboard focus\nFixed download progress"
            }
        },
        police: {
            label: "Police / Emergency Services",
            title: "The District Emergency Services Update",
            environment: "Live Server",
            fields: {
                added: "Added to emergency services",
                removed: "Removed from emergency services",
                changed: "Changed in emergency services",
                fixed: "Fixed in emergency services"
            },
            placeholders: {
                added: "New police equipment\nNew MDT feature",
                removed: "Old police menu\nLegacy ambulance system",
                changed: "Updated rank permissions\nChanged duty system",
                fixed: "Fixed garage restrictions\nFixed MDT access"
            }
        },
        vehicles: {
            label: "Vehicles",
            title: "The District Vehicle Update",
            environment: "Live Server",
            fields: {
                added: "Vehicles added",
                removed: "Vehicles removed",
                changed: "Vehicles changed",
                fixed: "Vehicle fixes"
            },
            placeholders: {
                added: "New vehicle\nNew police fleet car",
                removed: "Outdated vehicle\nDuplicate spawn",
                changed: "Updated handling\nChanged vehicle category",
                fixed: "Fixed broken lights\nFixed spawn issue"
            }
        },
        maps: {
            label: "Maps / MLOs",
            title: "The District Map Update",
            environment: "Live Server",
            fields: {
                added: "Added to map",
                removed: "Removed from map",
                changed: "Changed in map",
                fixed: "Fixed in map"
            },
            placeholders: {
                added: "New interior\nNew map location",
                removed: "Old map asset\nConflicting YMAP",
                changed: "Updated Legion Square\nChanged interior layout",
                fixed: "Fixed texture conflict\nFixed road collision"
            }
        },
        eup: {
            label: "EUP / Clothing",
            title: "The District EUP Update",
            environment: "Live Server",
            fields: {
                added: "Added to EUP",
                removed: "Removed from EUP",
                changed: "Changed in EUP",
                fixed: "Fixed in EUP"
            },
            placeholders: {
                added: "New uniform\nNew department clothing",
                removed: "Old uniform\nUnused clothing asset",
                changed: "Updated rank markings\nChanged uniform texture",
                fixed: "Fixed clipping\nFixed texture issue"
            }
        },
        community: {
            label: "Community / Other",
            title: "The District Community Update",
            environment: "Website / Services",
            fields: {
                added: "Added",
                removed: "Removed",
                changed: "Changed",
                fixed: "Fixed"
            },
            placeholders: {
                added: "New community feature",
                removed: "Removed old feature",
                changed: "Updated community system",
                fixed: "Fixed reported issue"
            }
        }
    };

    const KINDS = ["added", "removed", "changed", "fixed"];
    const ICONS = { added: "➕", removed: "➖", changed: "🛠️", fixed: "✅" };

    let selected = ["game"];
    let areaChanges = {};
    let saveTimer = null;

    function cleanLines(value) {
        return String(value || "")
            .split(/\r?\n/)
            .map(line => line.trim().replace(/^[-•+]\s*/, ""))
            .filter(Boolean)
            .slice(0, 30);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function ensureAreaState(key) {
        if (!areaChanges[key]) {
            areaChanges[key] = { added: "", removed: "", changed: "", fixed: "" };
        }
        return areaChanges[key];
    }

    function selectedLabels() {
        return selected.map(key => AREAS[key]?.label).filter(Boolean);
    }

    function defaultTitle() {
        if (selected.length === 1) return AREAS[selected[0]]?.title || "The District Development Update";
        return "The District Multi-System Update";
    }

    function defaultEnvironment() {
        if (selected.length === 1) return AREAS[selected[0]]?.environment || "Live Server";
        return "Multi-platform";
    }

    function renderChoices() {
        const target = document.getElementById("changeLogAreaChoices");
        if (!target) return;

        target.innerHTML = Object.entries(AREAS).map(([key, area]) => `
            <button
                type="button"
                class="changelog-area-choice ${selected.includes(key) ? "selected" : ""}"
                data-change-area-choice="${key}"
                aria-pressed="${selected.includes(key) ? "true" : "false"}"
            >${escapeHtml(area.label)}</button>
        `).join("");
    }

    function renderPanels() {
        const target = document.getElementById("changeLogAreaPanels");
        if (!target) return;

        if (!selected.length) {
            target.innerHTML = '<div class="changelog-area-empty">Choose at least one area above.</div>';
            return;
        }

        target.innerHTML = selected.map(key => {
            const area = AREAS[key];
            const state = ensureAreaState(key);
            return `
                <section class="changelog-area-panel" data-change-area-panel="${key}">
                    <div class="changelog-area-panel-head">
                        <strong>${escapeHtml(area.label)}</strong>
                        <span>All fields optional</span>
                    </div>
                    <div class="changelog-area-panel-grid">
                        ${KINDS.map(kind => `
                            <div class="changelog-field">
                                <label for="changeLog-${key}-${kind}">${escapeHtml(area.fields[kind])}</label>
                                <textarea
                                    id="changeLog-${key}-${kind}"
                                    rows="5"
                                    data-area-key="${key}"
                                    data-area-kind="${kind}"
                                    placeholder="${escapeHtml(area.placeholders[kind])}"
                                >${escapeHtml(state[kind] || "")}</textarea>
                            </div>
                        `).join("")}
                    </div>
                </section>
            `;
        }).join("");
    }

    function previewArea(areaKey) {
        const area = AREAS[areaKey];
        const state = ensureAreaState(areaKey);
        const pieces = KINDS.map(kind => {
            const lines = cleanLines(state[kind]);
            if (!lines.length) return "";
            return `
                <div class="discord-preview-area-subsection">
                    <b>${ICONS[kind]} ${escapeHtml(area.fields[kind])}</b><br>
                    ${lines.map(line => `• ${escapeHtml(line)}`).join("<br>")}
                </div>
            `;
        }).filter(Boolean).join("");

        if (!pieces) return "";
        return `
            <div class="discord-preview-field discord-preview-area-block">
                <strong>${escapeHtml(area.label)}</strong>
                ${pieces}
            </div>
        `;
    }

    function updatePreview() {
        const title = document.getElementById("changeLogTitle")?.value.trim() || defaultTitle();
        const summary = document.getElementById("changeLogSummary")?.value.trim() || (
            selected.length > 1
                ? `A new update covering ${selectedLabels().join(", ")} is ready for The District.`
                : `A new ${(AREAS[selected[0]]?.label || "development").toLowerCase()} update is ready for The District.`
        );
        const level = document.getElementById("changeLogDeveloperLevel")?.value || "Senior Developer";
        const type = document.getElementById("changeLogType")?.value || "Development Update";
        const environment = document.getElementById("changeLogEnvironment")?.value || defaultEnvironment();
        const version = document.getElementById("changeLogVersion")?.value.trim() || "Current Build";

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText("changeLogPreviewTitle", title);
        setText("changeLogPreviewSummary", summary);
        setText("changeLogPreviewLevel", level);
        setText("changeLogPreviewType", type);
        setText("changeLogPreviewEnvironment", environment);
        setText("changeLogPreviewVersion", version);
        setText("changeLogPreviewArea", selectedLabels().join(", ") || "None selected");

        const target = document.getElementById("changeLogPreviewFields");
        if (!target) return;

        const areaMarkup = selected.map(previewArea).filter(Boolean).join("");
        const known = cleanLines(document.getElementById("changeLogKnownIssues")?.value);
        const knownMarkup = known.length ? `
            <div class="discord-preview-field">
                <strong>⚠️ Known issues / next steps</strong>
                <p>${known.map(line => `• ${escapeHtml(line)}`).join("<br>")}</p>
            </div>
        ` : "";

        target.innerHTML = areaMarkup + knownMarkup || `
            <div class="discord-preview-field">
                <strong>CHANGE SUMMARY</strong>
                <p>Select one or more areas and only fill in the sections that apply.</p>
            </div>
        `;
    }

    function collectDraft() {
        const general = {};
        GENERAL_FIELDS.forEach(id => {
            const field = document.getElementById(id);
            if (field) general[id] = field.value;
        });

        return {
            version: 1,
            updated_at: Date.now(),
            selected,
            area_changes: areaChanges,
            general
        };
    }

    function setDraftStatus(text) {
        let state = document.getElementById("changeLogMultiDraftState");
        if (!state) {
            const note = document.querySelector("#changeLogForm .changelog-publish-note");
            if (!note) return;
            state = document.createElement("span");
            state.id = "changeLogMultiDraftState";
            state.className = "changelog-draft-state";
            state.innerHTML = "<i></i><span></span>";
            note.insertAdjacentElement("afterend", state);
        }
        const label = state.querySelector("span");
        if (label) label.textContent = text;
    }

    function saveDraft() {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(collectDraft()));
            const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            setDraftStatus(`Multi-area draft saved at ${time}`);
        } catch {
            setDraftStatus("Draft could not be saved in this browser");
        }
    }

    function queueSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveDraft, 180);
    }

    function restoreDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return false;
            const draft = JSON.parse(raw);
            if (!draft || typeof draft !== "object") return false;

            if (Array.isArray(draft.selected)) {
                selected = draft.selected.filter(key => AREAS[key]);
            }
            if (!selected.length) selected = ["game"];

            if (draft.area_changes && typeof draft.area_changes === "object") {
                areaChanges = draft.area_changes;
            }

            if (draft.general && typeof draft.general === "object") {
                Object.entries(draft.general).forEach(([id, value]) => {
                    const field = document.getElementById(id);
                    if (field) field.value = value ?? "";
                });
            }

            renderChoices();
            renderPanels();
            updatePreview();

            const saved = Number(draft.updated_at);
            if (Number.isFinite(saved)) {
                setDraftStatus(`Restored multi-area draft • ${new Date(saved).toLocaleString("en-GB", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                })}`);
            } else {
                setDraftStatus("Restored multi-area draft");
            }
            return true;
        } catch {
            return false;
        }
    }

    function updateEnvironmentForSelection() {
        const environment = document.getElementById("changeLogEnvironment");
        if (!environment) return;
        if (![...environment.options].some(option => option.value === "Multi-platform")) {
            environment.add(new Option("Multi-platform", "Multi-platform"));
        }
        environment.value = defaultEnvironment();
    }

    function toggleArea(key) {
        if (!AREAS[key]) return;
        if (selected.includes(key)) {
            selected = selected.filter(item => item !== key);
        } else {
            selected = [...selected, key];
            ensureAreaState(key);
        }

        renderChoices();
        renderPanels();
        updateEnvironmentForSelection();
        updatePreview();
        queueSave();
    }

    function payloadAreas() {
        return selected.map(key => {
            const state = ensureAreaState(key);
            return {
                key,
                added: cleanLines(state.added),
                removed: cleanLines(state.removed),
                changed: cleanLines(state.changed),
                fixed: cleanLines(state.fixed)
            };
        });
    }

    async function submitChangeLog(event) {
        event.preventDefault();

        const message = document.getElementById("changeLogMessage");
        const button = document.getElementById("changeLogSubmit");
        const token = localStorage.getItem("district_session");

        const showMessage = (text, type) => {
            if (!message) return;
            message.hidden = false;
            message.className = `changelog-form-message ${type}`;
            message.textContent = text;
        };

        if (!token) {
            showMessage("Your staff session has expired. Log in again before publishing.", "error");
            return;
        }

        if (!selected.length) {
            showMessage("Choose at least one change area before publishing.", "error");
            return;
        }

        const areas = payloadAreas();
        const knownIssues = cleanLines(document.getElementById("changeLogKnownIssues")?.value);
        const summary = document.getElementById("changeLogSummary")?.value.trim() || "";
        const hasChange = areas.some(area => KINDS.some(kind => area[kind].length > 0)) || knownIssues.length > 0;

        if (!hasChange && !summary) {
            showMessage("Add a summary or at least one change before publishing.", "error");
            return;
        }

        const payload = {
            change_areas: selected,
            areas,
            title: document.getElementById("changeLogTitle")?.value.trim() || "",
            version: document.getElementById("changeLogVersion")?.value.trim() || "",
            environment: document.getElementById("changeLogEnvironment")?.value || "",
            developer_level: document.getElementById("changeLogDeveloperLevel")?.value || "",
            update_type: document.getElementById("changeLogType")?.value || "",
            summary,
            known_issues: knownIssues
        };

        if (button) {
            button.disabled = true;
            button.textContent = "Publishing...";
        }
        if (message) message.hidden = true;

        try {
            const response = await fetch("/api/staff/changelog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            let data;
            try { data = await response.json(); }
            catch { data = { success: false, error: "The website returned an invalid response." }; }

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to publish the change log.");
            }

            saveDraft();
            showMessage(
                data.reference
                    ? `Change log published to Discord successfully. Reference: ${data.reference}`
                    : "Change log published to Discord successfully.",
                "success"
            );
        } catch (error) {
            showMessage(error.message || "Unable to publish the change log.", "error");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Publish to Discord ↗";
            }
        }
    }

    function install() {
        const original = document.getElementById("changeLogForm");
        const oldArea = document.getElementById("changeLogArea");
        if (!original || !oldArea || original.dataset.multiAreaEditor === "true") return false;

        const legacyKey = AREAS[oldArea.value] ? oldArea.value : "game";
        selected = [legacyKey];
        areaChanges[legacyKey] = {
            added: document.getElementById("changeLogAdded")?.value || "",
            removed: document.getElementById("changeLogRemoved")?.value || "",
            changed: document.getElementById("changeLogChanged")?.value || "",
            fixed: document.getElementById("changeLogFixed")?.value || ""
        };

        /* Clone after rebrand.js has finished so its single-area listeners are removed. */
        const form = original.cloneNode(true);
        original.replaceWith(form);
        form.dataset.multiAreaEditor = "true";

        const areaField = document.getElementById("changeLogArea")?.closest(".changelog-field");
        if (!areaField) return false;

        areaField.innerHTML = `
            <label>What did you change?</label>
            <div id="changeLogAreaChoices" class="changelog-area-multiselect" role="group" aria-label="Change areas"></div>
            <small class="changelog-multi-help">Choose as many as you need. For example: Game / Server + Discord + Website. Each selected area gets its own Added, Removed, Changed and Fixed boxes.</small>
        `;

        const firstLegacy = document.getElementById("changeLogAdded")?.closest(".changelog-field");
        if (firstLegacy) {
            const panels = document.createElement("div");
            panels.id = "changeLogAreaPanels";
            panels.className = "changelog-area-panels";
            firstLegacy.insertAdjacentElement("beforebegin", panels);
        }

        ["changeLogAdded", "changeLogRemoved", "changeLogChanged", "changeLogFixed"].forEach(id => {
            const field = document.getElementById(id)?.closest(".changelog-field");
            if (field) field.hidden = true;
        });

        const environment = document.getElementById("changeLogEnvironment");
        if (environment && ![...environment.options].some(option => option.value === "Multi-platform")) {
            environment.add(new Option("Multi-platform", "Multi-platform"));
        }

        const meta = document.querySelector("#staffChangeLogView .discord-preview-meta");
        const areaMeta = document.getElementById("changeLogPreviewArea");
        if (!areaMeta && meta) {
            meta.insertAdjacentHTML("afterbegin", '<div><strong>Change Areas</strong><span id="changeLogPreviewArea">Game / Server</span></div>');
        } else if (areaMeta) {
            areaMeta.closest("div")?.querySelector("strong")?.replaceChildren(document.createTextNode("Change Areas"));
        }

        renderChoices();
        renderPanels();

        form.addEventListener("click", event => {
            const choice = event.target.closest("[data-change-area-choice]");
            if (!choice) return;
            toggleArea(choice.dataset.changeAreaChoice);
        });

        form.addEventListener("input", event => {
            const input = event.target;
            if (input?.dataset?.areaKey && input?.dataset?.areaKind) {
                ensureAreaState(input.dataset.areaKey)[input.dataset.areaKind] = input.value;
            }
            updatePreview();
            queueSave();
        });

        form.addEventListener("change", () => {
            updatePreview();
            queueSave();
        });

        form.addEventListener("submit", submitChangeLog);
        form.addEventListener("reset", () => {
            localStorage.removeItem(DRAFT_KEY);
            setTimeout(() => {
                selected = ["game"];
                areaChanges = {};
                ensureAreaState("game");
                renderChoices();
                renderPanels();
                updateEnvironmentForSelection();
                updatePreview();
                setDraftStatus("Multi-area draft cleared");
            }, 0);
        });

        window.addEventListener("beforeunload", saveDraft);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") saveDraft();
        });

        window.updateChangeLogPreview = updatePreview;

        if (!restoreDraft()) {
            updateEnvironmentForSelection();
            updatePreview();
            setDraftStatus("Multi-area draft autosave ready");
        }

        return true;
    }

    function start() {
        let attempts = 0;
        const tryInstall = () => {
            attempts += 1;
            if (install() || attempts >= 12) return;
            setTimeout(tryInstall, 100);
        };
        setTimeout(tryInstall, 220);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
