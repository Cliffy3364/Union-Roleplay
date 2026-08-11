const STAFF_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";

const APPLICATION_TYPES = [
    "Whitelist Application",
    "Staff Application",
    "QA Tester Application",
    "Social Media Manager Application",
    "Media Application",
    "Script Developer Application",
    "Vehicle Developer Application",
    "EUP Developer Application",
    "UPD Command Application",
    "UHS Command Application"
];

let currentQueueType = null;
let currentQueueApplications = [];
let currentStatusFilter = "pending";

function getToken() {
    return localStorage.getItem("union_session");
}

async function staffFetch(path) {
    const token = getToken();

    if (!token) {
        throw new Error("Not logged in.");
    }

    const response = await fetch(`${STAFF_API}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}

function normalizeStatus(status) {
    return String(status || "")
        .trim()
        .toLowerCase();
}

function isPendingStatus(status) {
    return [
        "submitted",
        "pending",
        "pending review"
    ].includes(
        normalizeStatus(status)
    );
}

function isInterviewStatus(status) {
    return (
        normalizeStatus(status) ===
        "interview"
    );
}

function isOnHoldStatus(status) {
    return (
        normalizeStatus(status) ===
        "on hold"
    );
}

function isAcceptedStatus(status) {
    return (
        normalizeStatus(status) ===
        "accepted"
    );
}

function isDeclinedStatus(status) {
    return (
        normalizeStatus(status) ===
        "declined"
    );
}

function isActiveApplication(status) {
    return (
        isPendingStatus(status) ||
        isInterviewStatus(status) ||
        isOnHoldStatus(status)
    );
}

function filterApplicationsByStatus(applications, filter) {
    switch (filter) {
        case "interview":
            return applications.filter(app =>
                isInterviewStatus(app.status)
            );

        case "on-hold":
            return applications.filter(app =>
                isOnHoldStatus(app.status)
            );

        case "accepted":
            return applications.filter(app =>
                isAcceptedStatus(app.status)
            );

        case "declined":
            return applications.filter(app =>
                isDeclinedStatus(app.status)
            );

        case "pending":
        default:
            return applications.filter(app =>
                isPendingStatus(app.status)
            );
    }
}

function formatWaitTime(timestamp) {
    if (!timestamp) return "Unknown";

    const diff = Math.max(
        0,
        Date.now() - Number(timestamp)
    );

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
}

function applicantName(app) {
    return (
        app.discord_display_name ||
        app.discord_username ||
        app.discord_id ||
        "Unknown Applicant"
    );
}

function setActiveNav(button) {
    document
        .querySelectorAll(".staff-nav-item")
        .forEach(item => item.classList.remove("active"));

    button.classList.add("active");
}

function showDashboard() {
    const dashboard =
        document.getElementById("staffDashboardView");

    const queue =
        document.getElementById("staffQueueView");

    const title =
        document.getElementById("staffPageTitle");

    if (dashboard) dashboard.hidden = false;
    if (queue) queue.hidden = true;
    if (title) title.textContent = "Dashboard";
}

async function loadDashboardStats() {
    try {
        const data = await staffFetch(
            "/api/staff/applications/dashboard"
        );

        const summary = data.summary || {};

        const pending =
            document.getElementById("pendingCount");

        const interviews =
            document.getElementById("interviewCount");

        if (pending) {
            pending.textContent =
                Number(summary.pending || 0);
        }

        if (interviews) {
            interviews.textContent =
                Number(summary.interviews || 0);
        }

    } catch (error) {
        console.error(
            "Failed to load staff dashboard:",
            error
        );
    }
}

async function loadApplicationOverview() {
    const overview =
        document.getElementById("applicationOverview");

    if (!overview) return;

    overview.innerHTML =
        '<p class="staff-muted">Loading application queues...</p>';

    const rows = [];

    for (const type of APPLICATION_TYPES) {
        try {
            const data = await staffFetch(
                `/api/staff/applications?type=${encodeURIComponent(type)}`
            );

            const pending = (data.applications || [])
                .filter(app =>
                    isPendingStatus(app.status)
                );

            rows.push({
                type,
                count: pending.length,
                oldest: pending[0] || null
            });
            const badgeMap = {
    "Whitelist Application": "nav-count-whitelist",
    "Staff Application": "nav-count-staff",
    "QA Tester Application": "nav-count-qa",
    "Social Media Manager Application": "nav-count-social",
    "Media Application": "nav-count-media",
    "Script Developer Application": "nav-count-script",
    "Vehicle Developer Application": "nav-count-vehicle",
    "EUP Developer Application": "nav-count-eup",
    "UPD Command Application": "nav-count-upd",
    "UHS Command Application": "nav-count-uhs"
};

const badge = document.getElementById(badgeMap[type]);

if (badge) {
    badge.textContent = pending.length;

    if (pending.length > 0) {
        badge.classList.add("has-applications");
    } else {
        badge.classList.remove("has-applications");
    }
}

        } catch (error) {
            rows.push({
                type,
                count: 0,
                oldest: null
            });
        }
    }

   rows.sort((a, b) => b.count - a.count);

overview.innerHTML = rows
        .map(row => {

            const oldestTime =
                row.oldest?.submitted_at ||
                row.oldest?.created_at;

            return `
                <button
                    class="staff-overview-row"
                    data-overview-type="${row.type}"
                >
                    <div>
                        <strong>${row.type.replace(" Application", "")}</strong>
                        <span>
                            ${
                                row.oldest
                                    ? `Oldest waiting ${formatWaitTime(oldestTime)}`
                                    : "No applications waiting"
                            }
                        </span>
                    </div>

                    <div class="staff-overview-count">
                        ${row.count}
                    </div>
                </button>
            `;
        })
        .join("");

    document
        .querySelectorAll("[data-overview-type]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const type =
                        button.dataset.overviewType;

                    await openQueue(type);
                }
            );

        });
}

function renderQueue(applications) {
    const queue =
        document.getElementById("applicationQueue");

    if (!queue) return;

    if (!applications.length) {
        queue.innerHTML = `
            <div class="staff-empty-state">
                <h3>Queue clear</h3>
                <p>
                    There are currently no applications
                    waiting in this section.
                </p>
            </div>
        `;

        return;
    }

    queue.innerHTML = applications
        .map((app, index) => {

            const submitted =
                app.submitted_at ||
                app.created_at ||
                Date.now();

            const name =
                applicantName(app);

            const avatar = app.avatar
                ? `
                    <img
                        src="https://cdn.discordapp.com/avatars/${app.discord_id}/${app.avatar}.png?size=96"
                        alt=""
                    >
                `
                : name.charAt(0).toUpperCase();

            return `
                <article class="staff-application-row">

                    <div class="staff-queue-number">
                        ${index + 1}
                    </div>

                    <div class="staff-applicant-avatar">
                        ${avatar}
                    </div>

                    <div class="staff-applicant-info">
                        <strong>${name}</strong>

                        <span>
                            ${app.union_id || "No Union ID"}
                            ·
                            ${app.reference || `#${app.id}`}
                        </span>
                    </div>

                    <div class="staff-application-meta">
                        <span>Waiting</span>
                        <strong>
                            ${formatWaitTime(submitted)}
                        </strong>
                    </div>

                    <div class="staff-application-meta">
                        <span>Status</span>
                        <strong>
                            ${app.status || "Submitted"}
                        </strong>
                    </div>

                    <a
                        class="staff-review-button"
                        href="review-application.html?id=${app.id}"
                    >
                        Review
                    </a>

                </article>
            `;
        })
        .join("");
}

async function openQueue(type) {
    const dashboard =
        document.getElementById("staffDashboardView");

    const queueView =
        document.getElementById("staffQueueView");

    const pageTitle =
        document.getElementById("staffPageTitle");

    const queueTitle =
        document.getElementById("queueTitle");

    const queue =
        document.getElementById("applicationQueue");

    if (dashboard) dashboard.hidden = true;
    if (queueView) queueView.hidden = false;

    if (pageTitle) {
        pageTitle.textContent =
            type.replace(" Application", "");
    }

    if (queueTitle) {
        queueTitle.textContent = type;
    }

    if (queue) {
        queue.innerHTML =
            '<p class="staff-muted">Loading queue...</p>';
    }

    try {
        const data = await staffFetch(
            `/api/staff/applications?type=${encodeURIComponent(type)}`
        );

currentQueueType = type;

currentQueueApplications =
    data.applications || [];

const applications =
    filterApplicationsByStatus(
        currentQueueApplications,
        currentStatusFilter
    );

renderQueue(applications);

    } catch (error) {
        if (queue) {
            queue.innerHTML = `
                <div class="staff-empty-state">
                    <h3>Unable to load queue</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const loading =
            document.getElementById("staffLoading");

        const denied =
            document.getElementById("staffDenied");

        const panel =
            document.getElementById("staffPanel");

        if (!window.UnionAuth) {
            if (loading) loading.hidden = true;
            if (denied) denied.hidden = false;
            return;
        }

        const user =
            await UnionAuth.getCurrentUser();

        if (loading) {
            loading.hidden = true;
        }

        if (!user || user.is_staff !== true) {
            if (denied) {
                denied.hidden = false;
            }

            return;
        }

        if (panel) {
            panel.hidden = false;
        }

  document
    .querySelectorAll(
        ".staff-nav-item[data-type]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                setActiveNav(button);

                currentStatusFilter = "pending";

                document
                    .querySelectorAll(
                        ".staff-status-filter-button"
                    )
                    .forEach(item => {
                        item.classList.toggle(
                            "active",
                            item.dataset.statusFilter ===
                                "pending"
                        );
                    });

                await openQueue(
                    button.dataset.type
                );
            }
        );

    });

    document
    .querySelectorAll(
        ".staff-status-filter-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".staff-status-filter-button"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                currentStatusFilter =
                    button.dataset.statusFilter ||
                    "pending";

                const filtered =
                    filterApplicationsByStatus(
                        currentQueueApplications,
                        currentStatusFilter
                    );

                renderQueue(filtered);
            }
        );

    });

        const dashboardButton =
            document.querySelector(
                '.staff-nav-item[data-view="dashboard"]'
            );

        if (dashboardButton) {
            dashboardButton.addEventListener(
                "click",
                () => {

                    setActiveNav(
                        dashboardButton
                    );

                    showDashboard();
                }
            );
        }

        await loadDashboardStats();
        await loadApplicationOverview();
    }
);