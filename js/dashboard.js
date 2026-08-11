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
                Array.isArray(data.applications)
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
                whitelistApplications[0] || null;


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
                    ) || "Submitted";

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

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );
        }
    }
);