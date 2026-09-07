/* ==========================================================
   THE DISTRICT — CHANGE LOG UI CLEANUP
   Removes the original single-area Added / Removed / Changed /
   Fixed fields after the multi-area editor has created its own
   area panels. Keeps Summary and Known Issues / Next Steps.
========================================================== */
(function () {
    function cleanupChangeLogForm() {
        const form = document.getElementById("changeLogForm");
        const areaPanels = document.getElementById("changeLogAreaPanels");

        if (!form || !areaPanels) return false;

        const legacyIds = [
            "changeLogAdded",
            "changeLogRemoved",
            "changeLogChanged",
            "changeLogFixed",
            "changeLogExternal"
        ];

        const legacyFields = legacyIds
            .map(id => document.getElementById(id)?.closest(".changelog-field"))
            .filter(Boolean);

        const knownField = document.getElementById("changeLogKnownIssues")?.closest(".changelog-field");
        const legacyGrid = legacyFields[0]?.closest(".changelog-field-grid") || knownField?.closest(".changelog-field-grid");

        if (knownField) {
            let followUp = document.getElementById("changeLogFollowUpSection");

            if (!followUp) {
                followUp = document.createElement("div");
                followUp.id = "changeLogFollowUpSection";
                followUp.className = "changelog-follow-up-section";
                followUp.innerHTML = `
                    <div class="changelog-section-title">
                        <span>03</span> Follow-up
                        <small style="margin-left:auto;font-weight:500;opacity:.65">Optional</small>
                    </div>
                    <div class="changelog-field-grid changelog-follow-up-grid"></div>
                `;
                areaPanels.insertAdjacentElement("afterend", followUp);
            }

            const targetGrid = followUp.querySelector(".changelog-follow-up-grid");
            if (targetGrid && knownField.parentElement !== targetGrid) {
                targetGrid.appendChild(knownField);
            }

            knownField.classList.add("full");
        }

        legacyFields.forEach(field => field.remove());

        if (legacyGrid && legacyGrid !== knownField?.parentElement) {
            const remainingFields = legacyGrid.querySelectorAll(".changelog-field");
            if (!remainingFields.length) legacyGrid.remove();
        }

        [...form.querySelectorAll(".changelog-section-title")].forEach(heading => {
            const text = heading.textContent.replace(/\s+/g, " ").trim().toLowerCase();
            if (text.includes("02") && text.includes("changes") && !heading.closest("#changeLogFollowUpSection")) {
                const next = heading.nextElementSibling;
                const containsMultiEditor = next?.id === "changeLogAreaPanels" || next?.querySelector?.("#changeLogAreaPanels");
                if (!containsMultiEditor) heading.remove();
            }
        });

        form.classList.add("changelog-clean-layout");
        return true;
    }

    function runCleanup(attempt = 0) {
        if (cleanupChangeLogForm()) return;
        if (attempt >= 30) return;
        window.setTimeout(() => runCleanup(attempt + 1), 100);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => runCleanup(), { once: true });
    } else {
        runCleanup();
    }
})();
