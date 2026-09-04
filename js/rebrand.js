/* Global presentation layer for the 2026 District rebrand. */
(function () {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    function setupNavbarScroll() {
        const nav = document.getElementById("navbar");
        if (!nav) return;
        const sync = () => nav.classList.toggle("navbar-scrolled", window.scrollY > 18);
        sync();
        window.addEventListener("scroll", sync, { passive: true });
    }

    function setupReveals() {
        if (reduceMotion || !("IntersectionObserver" in window)) return;
        const targets = document.querySelectorAll(
            ".district-section-head, .district-feature-card, .district-experience-panel, .district-event-card, .district-join-card"
        );
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("district-revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        targets.forEach((target) => {
            target.classList.add("district-reveal");
            observer.observe(target);
        });
    }

    const CHANGE_LOG_AREAS = {
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
                added: "New staff dashboard\nNew community page\nNew application controls",
                removed: "Old landing section\nUnused navigation item",
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
                added: "New ticket category\nNew staff command\nNew automated notification",
                removed: "Old ticket panel\nUnused command",
                changed: "Updated staff permissions\nChanged ticket workflow",
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
                added: "New API route\nNew database table\nNew permission check",
                removed: "Deprecated API route\nOld database handler",
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
                removed: "Old banking resource\nUnused dependency",
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
                added: "New app\nNew first-time setup\nNew camera feature",
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
                added: "New police equipment\nNew vehicle restriction\nNew MDT feature",
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
                added: "Added new vehicle\nAdded new police fleet car",
                removed: "Removed outdated vehicle\nRemoved duplicate spawn",
                changed: "Updated handling\nChanged vehicle category",
                fixed: "Fixed broken lights\nFixed vehicle spawn issue"
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

    function changelogArea() {
        const key = document.getElementById("changeLogArea")?.value || "game";
        return CHANGE_LOG_AREAS[key] || CHANGE_LOG_AREAS.game;
    }

    function changelogLines(value) {
        if (typeof window.changeLogLines === "function") {
            return window.changeLogLines(value);
        }

        return String(value || "")
            .split(/\r?\n/)
            .map(line => line.trim().replace(/^[-•+]\s*/, ""))
            .filter(Boolean)
            .slice(0, 30);
    }

    function safeHtml(value) {
        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value);
        }

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function previewField(label, icon, value) {
        const lines = changelogLines(value);
        if (!lines.length) return "";

        return `
            <div class="discord-preview-field">
                <strong>${icon} ${safeHtml(label)}</strong>
                <p>${safeHtml(lines.map(line => `• ${line}`).join("\n"))}</p>
            </div>
        `;
    }

    function enhancedChangeLogPreview() {
        const area = changelogArea();
        const title = document.getElementById("changeLogTitle")?.value.trim() || area.title;
        const summary = document.getElementById("changeLogSummary")?.value.trim() || `A new ${area.label.toLowerCase()} update is ready for The District.`;
        const level = document.getElementById("changeLogDeveloperLevel")?.value || "Senior Developer";
        const type = document.getElementById("changeLogType")?.value || "Development Update";
        const environment = document.getElementById("changeLogEnvironment")?.value || area.environment;
        const version = document.getElementById("changeLogVersion")?.value.trim() || "Current Build";

        const setText = (id, value) => {
            const target = document.getElementById(id);
            if (target) target.textContent = value;
        };

        setText("changeLogPreviewTitle", title);
        setText("changeLogPreviewSummary", summary);
        setText("changeLogPreviewLevel", level);
        setText("changeLogPreviewType", type);
        setText("changeLogPreviewEnvironment", environment);
        setText("changeLogPreviewVersion", version);
        setText("changeLogPreviewArea", area.label);

        const fieldsTarget = document.getElementById("changeLogPreviewFields");
        if (fieldsTarget) {
            const markup = [
                previewField(area.fields.added, "➕", document.getElementById("changeLogAdded")?.value),
                previewField(area.fields.removed, "➖", document.getElementById("changeLogRemoved")?.value),
                previewField(area.fields.changed, "🛠️", document.getElementById("changeLogChanged")?.value),
                previewField(area.fields.fixed, "✅", document.getElementById("changeLogFixed")?.value),
                previewField("Known issues / next steps", "⚠️", document.getElementById("changeLogKnownIssues")?.value)
            ].filter(Boolean).join("");

            fieldsTarget.innerHTML = markup || `
                <div class="discord-preview-field">
                    <strong>CHANGE SUMMARY</strong>
                    <p>All change boxes are optional. Add only the sections that apply to this update.</p>
                </div>
            `;
        }
    }

    function updateChangeLogAreaUI(setEnvironment = false) {
        const area = changelogArea();

        const mappings = [
            ["changeLogAdded", area.fields.added, area.placeholders.added],
            ["changeLogRemoved", area.fields.removed, area.placeholders.removed],
            ["changeLogChanged", area.fields.changed, area.placeholders.changed],
            ["changeLogFixed", area.fields.fixed, area.placeholders.fixed]
        ];

        mappings.forEach(([id, labelText, placeholder]) => {
            const input = document.getElementById(id);
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = labelText;
            if (input) input.placeholder = placeholder;
        });

        if (setEnvironment) {
            const environment = document.getElementById("changeLogEnvironment");
            if (environment) environment.value = area.environment;
        }

        enhancedChangeLogPreview();
    }

    async function enhancedSubmitChangeLog(event) {
        event.preventDefault();

        const submitButton = document.getElementById("changeLogSubmit");
        const message = document.getElementById("changeLogMessage");
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

        const payload = {
            change_area: document.getElementById("changeLogArea")?.value || "game",
            title: document.getElementById("changeLogTitle")?.value.trim() || "",
            version: document.getElementById("changeLogVersion")?.value.trim() || "",
            environment: document.getElementById("changeLogEnvironment")?.value || "",
            developer_level: document.getElementById("changeLogDeveloperLevel")?.value || "",
            update_type: document.getElementById("changeLogType")?.value || "",
            summary: document.getElementById("changeLogSummary")?.value.trim() || "",
            added: changelogLines(document.getElementById("changeLogAdded")?.value),
            removed: changelogLines(document.getElementById("changeLogRemoved")?.value),
            changed: changelogLines(document.getElementById("changeLogChanged")?.value),
            fixed: changelogLines(document.getElementById("changeLogFixed")?.value),
            known_issues: changelogLines(document.getElementById("changeLogKnownIssues")?.value)
        };

        const hasChange = [payload.added, payload.removed, payload.changed, payload.fixed, payload.known_issues]
            .some(items => items.length > 0);

        if (!hasChange && !payload.summary) {
            showMessage("Add a summary or at least one change before publishing.", "error");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Publishing...";
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
            try {
                data = await response.json();
            } catch {
                data = { success: false, error: "The website returned an invalid response." };
            }

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to publish the change log.");
            }

            showMessage(
                data.reference
                    ? `Change log published to Discord successfully. Reference: ${data.reference}`
                    : "Change log published to Discord successfully.",
                "success"
            );
        } catch (error) {
            showMessage(error.message || "Unable to publish the change log.", "error");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Publish to Discord ↗";
            }
        }
    }

    function setupEnhancedChangeLogs() {
        const originalForm = document.getElementById("changeLogForm");
        if (!originalForm) return;

        const titleInput = document.getElementById("changeLogTitle");
        titleInput?.removeAttribute("required");

        const typeField = document.getElementById("changeLogType")?.closest(".changelog-field");
        if (typeField && !document.getElementById("changeLogArea")) {
            typeField.insertAdjacentHTML("beforebegin", `
                <div class="changelog-field">
                    <label for="changeLogArea">What did you change?</label>
                    <select id="changeLogArea">
                        <option value="game">Game / Server</option>
                        <option value="website">Website</option>
                        <option value="discord">Discord</option>
                        <option value="backend">Backend / API</option>
                        <option value="scripts">Scripts / Systems</option>
                        <option value="phone">Phone System</option>
                        <option value="police">Police / Emergency Services</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="maps">Maps / MLOs</option>
                        <option value="eup">EUP / Clothing</option>
                        <option value="community">Community / Other</option>
                    </select>
                    <small>This changes the wording used throughout the Discord update.</small>
                </div>
            `);
        }

        const external = document.getElementById("changeLogExternal");
        if (external) {
            external.id = "changeLogFixed";
            const label = document.querySelector('label[for="changeLogExternal"]');
            if (label) label.setAttribute("for", "changeLogFixed");
        }

        const changesHeading = [...document.querySelectorAll("#changeLogForm .changelog-section-title")][1];
        if (changesHeading) {
            changesHeading.innerHTML = '<span>02</span> Changes <small style="margin-left:auto;font-weight:500;opacity:.65">Every section below is optional</small>';
        }

        const environment = document.getElementById("changeLogEnvironment");
        if (environment) {
            [
                ["Discord / Community", "Discord / Community"],
                ["Backend Services", "Backend Services"]
            ].forEach(([value, label]) => {
                if (![...environment.options].some(option => option.value === value)) {
                    environment.add(new Option(label, value));
                }
            });
        }

        const meta = document.querySelector("#staffChangeLogView .discord-preview-meta");
        if (meta && !document.getElementById("changeLogPreviewArea")) {
            meta.insertAdjacentHTML("afterbegin", `
                <div><strong>Change Area</strong><span id="changeLogPreviewArea">Game / Server</span></div>
            `);
        }

        /* Clone the form so the original changelog listeners are replaced cleanly. */
        const form = originalForm.cloneNode(true);
        originalForm.replaceWith(form);

        const areaSelect = document.getElementById("changeLogArea");
        areaSelect?.addEventListener("change", () => updateChangeLogAreaUI(true));
        form.addEventListener("submit", enhancedSubmitChangeLog);
        form.addEventListener("input", enhancedChangeLogPreview);
        form.addEventListener("change", enhancedChangeLogPreview);
        form.addEventListener("reset", () => {
            window.setTimeout(() => {
                const msg = document.getElementById("changeLogMessage");
                if (msg) msg.hidden = true;
                updateChangeLogAreaUI(true);
            }, 0);
        });

        document.getElementById("changeLogNav")?.addEventListener("click", () => {
            window.setTimeout(enhancedChangeLogPreview, 0);
        });

        /* Make the existing staff-page function use the upgraded preview too. */
        window.updateChangeLogPreview = enhancedChangeLogPreview;

        updateChangeLogAreaUI(false);
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupNavbarScroll();
        setupReveals();
        setupEnhancedChangeLogs();
    });
})();
