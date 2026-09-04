/* ==========================================================
   THE DISTRICT — V2 INTERACTIONS
========================================================== */
(function () {
    const CHANGELOG_DRAFT_KEY = "district_staff_changelog_draft_v2";
    const CHANGELOG_FIELDS = [
        "changeLogArea",
        "changeLogTitle",
        "changeLogVersion",
        "changeLogEnvironment",
        "changeLogDeveloperLevel",
        "changeLogType",
        "changeLogSummary",
        "changeLogAdded",
        "changeLogRemoved",
        "changeLogChanged",
        "changeLogFixed",
        "changeLogKnownIssues"
    ];

    function setupV2Reveals() {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
        if (!("IntersectionObserver" in window)) return;

        const targets = document.querySelectorAll(
            ".v2-card, .v2-standard-item, .v2-route article, .v2-event, .v2-wiki-banner, .v2-knowledge-list a, .wiki-card"
        );

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("v2-revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: .08, rootMargin: "0px 0px -30px 0px" });

        targets.forEach((target, index) => {
            target.classList.add("v2-reveal");
            target.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
            observer.observe(target);
        });
    }

    function readDraft() {
        try {
            const raw = localStorage.getItem(CHANGELOG_DRAFT_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : null;
        } catch {
            return null;
        }
    }

    function draftStateElement() {
        let status = document.getElementById("changeLogDraftState");
        if (status) return status;

        const note = document.querySelector("#changeLogForm .changelog-publish-note");
        if (!note) return null;

        status = document.createElement("span");
        status.id = "changeLogDraftState";
        status.className = "changelog-draft-state";
        status.innerHTML = "<i></i><span>Draft autosave ready</span>";
        note.insertAdjacentElement("afterend", status);
        return status;
    }

    function setDraftState(text) {
        const status = draftStateElement();
        const label = status?.querySelector("span");
        if (label) label.textContent = text;
    }

    function collectDraft() {
        const values = {};
        CHANGELOG_FIELDS.forEach(id => {
            const field = document.getElementById(id);
            if (field) values[id] = field.value;
        });

        return {
            version: 2,
            updated_at: Date.now(),
            values
        };
    }

    function saveDraft() {
        const form = document.getElementById("changeLogForm");
        if (!form) return;

        try {
            localStorage.setItem(CHANGELOG_DRAFT_KEY, JSON.stringify(collectDraft()));
            const time = new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit"
            });
            setDraftState(`Draft saved automatically at ${time}`);
        } catch {
            setDraftState("Draft could not be saved in this browser");
        }
    }

    function restoreDraft() {
        const draft = readDraft();
        if (!draft?.values) {
            setDraftState("Draft autosave ready");
            return false;
        }

        const area = document.getElementById("changeLogArea");
        if (area && Object.prototype.hasOwnProperty.call(draft.values, "changeLogArea")) {
            area.value = draft.values.changeLogArea;
            area.dispatchEvent(new Event("change", { bubbles: true }));
        }

        CHANGELOG_FIELDS.forEach(id => {
            if (id === "changeLogArea") return;
            const field = document.getElementById(id);
            if (!field) return;
            if (!Object.prototype.hasOwnProperty.call(draft.values, id)) return;
            field.value = draft.values[id];
        });

        if (typeof window.updateChangeLogPreview === "function") {
            window.updateChangeLogPreview();
        }

        const saved = Number(draft.updated_at);
        if (Number.isFinite(saved)) {
            const when = new Date(saved).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            });
            setDraftState(`Restored saved draft • ${when}`);
        } else {
            setDraftState("Restored saved draft");
        }

        return true;
    }

    function setupPersistentChangeLog() {
        const form = document.getElementById("changeLogForm");
        if (!form || form.dataset.draftPersistence === "true") return false;

        form.dataset.draftPersistence = "true";
        draftStateElement();

        restoreDraft();

        let timer = null;
        const queueSave = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(saveDraft, 160);
        };

        form.addEventListener("input", queueSave);
        form.addEventListener("change", queueSave);

        form.addEventListener("reset", () => {
            localStorage.removeItem(CHANGELOG_DRAFT_KEY);
            window.setTimeout(() => {
                setDraftState("Draft cleared");
            }, 20);
        });

        window.addEventListener("beforeunload", saveDraft);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") saveDraft();
        });

        document.getElementById("changeLogNav")?.addEventListener("click", () => {
            window.setTimeout(() => {
                restoreDraft();
            }, 30);
        });

        return true;
    }

    function initialise() {
        setupV2Reveals();

        /* rebrand.js upgrades/clones the changelog form at DOM ready.
           A short delay ensures we bind persistence to the final form. */
        window.setTimeout(() => {
            if (!setupPersistentChangeLog()) {
                window.setTimeout(setupPersistentChangeLog, 250);
            }
        }, 120);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, { once: true });
    } else {
        initialise();
    }
})();
