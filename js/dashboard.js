const DASHBOARD_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";


async function dashboardFetch(path) {

    const token =
        localStorage.getItem("union_session");

    if (!token) {
        throw new Error("Not logged in.");
    }

    const response = await fetch(
        `${DASHBOARD_API}${path}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.error || "Request failed."
        );
    }

    return data;
}


function getApplicationStatus(application) {

    return String(
        application?.status || ""
    ).trim();
}


function formatApplicationDate(timestamp) {

    if (!timestamp) {
        return "Unknown date";
    }

    const date =
        new Date(
            Number(timestamp)
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown date";
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function statusClass(status) {

    const value =
        String(status || "")
            .trim()
            .toLowerCase();

    if (
        value === "submitted" ||
        value === "pending" ||
        value === "pending review"
    ) {
        return "pending";
    }

    if (value === "interview") {
        return "interview";
    }

    if (value === "on hold") {
        return "on-hold";
    }

    if (value === "accepted") {
        return "accepted";
    }

    if (value === "declined") {
        return "declined";
    }

    return "pending";
}


function renderRecentApplications(
    applications
) {

    const container =
        document.getElementById(
            "dashboardRecentApplications"
        );

    if (!container) {
        return;
    }


    if (!applications.length) {

        container.innerHTML = `
            <div class="dashboard-applications-empty">

                <h3>
                    No applications yet
                </h3>

                <p>
                    You have not submitted any applications.
                </p>

            </div>
        `;

        return;
    }


    const recent =
        applications
            .slice(0, 5);


    container.innerHTML =
        recent
            .map(
                application => {

                    const title =
                        application.application_type ||
                        "Application";

                    const reference =
                        application.reference ||
                        `#${application.id || ""}`;

                    const status =
                        getApplicationStatus(
                            application
                        ) || "Submitted";

                    const submitted =
                        application.submitted_at ||
                        application.created_at;


                    return `
                        <article class="dashboard-application-row">

                            <div class="dashboard-application-main">

                                <div class="dashboard-application-icon">
                                    ${String(title)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>

                                    <h3>
                                        ${title}
                                    </h3>

                                    <p>
                                        ${reference}
                                        ·
                                        ${formatApplicationDate(submitted)}
                                    </p>

                                </div>

                            </div>


                            <div class="dashboard-application-status">

                                <span
                                    class="
                                        dashboard-status-badge
                                        ${statusClass(status)}
                                    "
                                >
                                    ${status}
                                </span>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!window.UnionAuth) {
            return;
        }

        try {

            const user =
                await UnionAuth.getCurrentUser();

            const accountButton =
                document.getElementById(
                    "dashboardAccountButton"
                );


            if (!user) {

                if (accountButton) {

                    accountButton.textContent =
                        "Login with Discord";

                    accountButton.href =
                        `${DASHBOARD_API}/api/auth/discord`;
                }

                return;
            }


            /* =========================
               DISCORD ACCOUNT
            ========================= */

            const title =
                document.querySelector(
                    ".profile-placeholder h2"
                );

            const subtitle =
                document.querySelector(
                    ".profile-placeholder p"
                );

            const avatar =
                document.querySelector(
                    ".profile-avatar"
                );


            if (title) {

                title.textContent =
                    user.discord_display_name ||
                    user.discord_username ||
                    user.username ||
                    "Union Member";
            }


            if (subtitle) {

                subtitle.textContent =
                    user.union_id ||
                    "Union Roleplay Member";
            }


            if (avatar) {

                if (
                    user.avatar &&
                    user.discord_id
                ) {

                    avatar.innerHTML = `
                        <img
                            src="https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=128"
                            alt=""
                            style="
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                                object-fit: cover;
                            "
                        >
                    `;

                } else {

                    avatar.textContent =
                        (
                            user.discord_display_name ||
                            user.discord_username ||
                            user.username ||
                            "U"
                        )
                        .charAt(0)
                        .toUpperCase();
                }
            }


            if (accountButton) {

                accountButton.textContent =
                    "Account Connected";

                accountButton.href =
                    "#";

                accountButton.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                    }
                );
            }


            /* =========================
               APPLICATION HISTORY
            ========================= */

            const data =
                await dashboardFetch(
                    "/api/applications/history"
                );

            const applications =
                Array.isArray(
                    data.applications
                )
                    ? data.applications
                    : [];


            /* =========================
               APPLICATION COUNT
            ========================= */

            const applicationCount =
                document.getElementById(
                    "dashboardApplicationCount"
                );

            const applicationDescription =
                document.getElementById(
                    "dashboardApplicationDescription"
                );


            if (applicationCount) {

                applicationCount.textContent =
                    `${applications.length} ${
                        applications.length === 1
                            ? "Application"
                            : "Applications"
                    }`;
            }


            if (applicationDescription) {

                if (applications.length > 0) {

                    applicationDescription.textContent =
                        "View your submitted applications and their current status.";

                } else {

                    applicationDescription.textContent =
                        "You have not submitted any applications yet.";
                }
            }


            /* =========================
               WHITELIST STATUS
            ========================= */

            const whitelistStatus =
                document.getElementById(
                    "dashboardWhitelistStatus"
                );

            const whitelistDescription =
                document.getElementById(
                    "dashboardWhitelistDescription"
                );


            const whitelistApplications =
                applications.filter(
                    application =>
                        String(
                            application.application_type ||
                            ""
                        )
                        .toLowerCase() ===
                        "whitelist application"
                );


            const latestWhitelist =
                whitelistApplications[0] ||
                null;


            if (!latestWhitelist) {

                if (whitelistStatus) {

                    whitelistStatus.textContent =
                        "Not Applied";
                }

                if (whitelistDescription) {

                    whitelistDescription.textContent =
                        "You have not submitted a whitelist application yet.";
                }

            } else {

                const status =
                    getApplicationStatus(
                        latestWhitelist
                    ) ||
                    "Submitted";


                if (whitelistStatus) {

                    whitelistStatus.textContent =
                        status;
                }


                if (whitelistDescription) {

                    switch (
                        status.toLowerCase()
                    ) {

                        case "submitted":

                            whitelistDescription.textContent =
                                "Your whitelist application has been submitted and is waiting for staff review.";

                            break;


                        case "pending":
                        case "pending review":

                            whitelistDescription.textContent =
                                "Your whitelist application is currently being reviewed by staff.";

                            break;


                        case "interview":

                            whitelistDescription.textContent =
                                "Your whitelist application has progressed to the interview stage.";

                            break;


                        case "on hold":

                            whitelistDescription.textContent =
                                "Your whitelist application is currently on hold.";

                            break;


                        case "accepted":

                            whitelistDescription.textContent =
                                "Your whitelist application has been accepted.";

                            break;


                        case "declined":

                            whitelistDescription.textContent =
                                "Your whitelist application was not successful.";

                            break;


                        default:

                            whitelistDescription.textContent =
                                "View your application for the latest information.";

                            break;
                    }
                }
            }


            /* =========================
               RECENT APPLICATIONS
            ========================= */

            renderRecentApplications(
                applications
            );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            const container =
                document.getElementById(
                    "dashboardRecentApplications"
                );


            if (container) {

                container.innerHTML = `
                    <div class="dashboard-applications-empty">

                        <h3>
                            Unable to load applications
                        </h3>

                        <p>
                            Please refresh the page and try again.
                        </p>

                    </div>
                `;
            }
        }
    }
);