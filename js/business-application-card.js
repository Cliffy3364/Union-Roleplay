/* ==========================================================
   THE DISTRICT — BUSINESS OWNERSHIP APPLICATION CARD
========================================================== */
(function () {
    function injectBusinessApplication() {
        if (!document.querySelector(".applications-page") || document.querySelector('[data-application-type="Business Ownership Application"]')) {
            return;
        }

        const groups = [...document.querySelectorAll(".applications-group")];
        const developmentGroup = groups.find(group =>
            group.querySelector(".applications-group-heading span")?.textContent.trim().toUpperCase() === "DEVELOPMENT"
        );

        if (!developmentGroup) return;

        const section = document.createElement("div");
        section.className = "applications-group";
        section.innerHTML = `
            <div class="applications-group-heading">
                <div>
                    <span>BUSINESSES</span>
                    <h2>Own something in the city</h2>
                </div>
                <p>Apply to own and operate a player-run business within The District.</p>
            </div>

            <div class="applications-role-grid">
                <article
                    class="application-role-card"
                    data-application-card
                    data-application-type="Business Ownership Application"
                >
                    <div class="application-role-top">
                        <div class="application-role-icon">BO</div>
                        <span class="application-role-status" data-application-status>
                            <span></span>
                            OPEN
                        </span>
                    </div>

                    <div class="application-role-content">
                        <span class="application-role-category">PLAYER BUSINESS</span>
                        <h3>Business Ownership</h3>
                        <p>
                            Pitch your business, explain how you would run it and show how it would create proper roleplay for customers, employees and the wider city.
                        </p>
                    </div>

                    <a
                        href="apply.html?type=Business%20Ownership%20Application"
                        class="application-role-action"
                        data-application-link
                    >
                        <span data-application-link-text>Business Ownership Application</span>
                        <strong>→</strong>
                    </a>
                </article>
            </div>
        `;

        developmentGroup.insertAdjacentElement("beforebegin", section);

        const count = document.getElementById("applicationsAvailableCount");
        if (count) {
            count.textContent = String(document.querySelectorAll("[data-application-card]").length);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectBusinessApplication, { once: true });
    } else {
        injectBusinessApplication();
    }
})();
