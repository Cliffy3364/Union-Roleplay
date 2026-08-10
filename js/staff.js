const STAFF_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";

const APPLICATION_TYPES = [
    { type: "Whitelist Application", countId: "count-whitelist" },
    { type: "Staff Application", countId: "count-staff" },
    { type: "QA Tester Application", countId: "count-qa" },
    { type: "Social Media Manager Application", countId: "count-social" },
    { type: "Media Application", countId: "count-media" },
    { type: "Script Developer Application", countId: "count-script" },
    { type: "Vehicle Developer Application", countId: "count-vehicle" },
    { type: "EUP Developer Application", countId: "count-eup" },
    { type: "UPD Command Application", countId: "count-upd" },
    { type: "UHS Command Application", countId: "count-uhs" }
];

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

function formatWaitTime(timestamp) {
    if (!timestamp) return "Unknown";

    const diff = Date.now() - Number(timestamp);

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;

    return `${Math.max(minutes, 0)}m`;
}

function getWaitClass(timestamp) {
    const diff = Date.now() - Number(timestamp || Date.now());

    if (diff >= 7 * 86400000) return "wait-critical";
    if (diff >= 3 * 86400000) return "wait-high";
    if (diff >= 86400000) return "wait-medium";

    return "wait-normal";
}

async function loadApplicationCounts() {
    for (const item of APPLICATION_TYPES) {
        try {
            const data = await staffFetch(
                `/api/staff/applications?type=${encodeURIComponent(item.type)}`
            );

            const pending = (data.applications || []).filter(app => {
                const status = String(app.status || "").toLowerCase();

                return (
                    status === "submitted" ||
                    status === "pending review" ||
                    status === "pending"
                );
            });

            const count = document.getElementById(item.countId);

            if (count) {
                count.textContent = pending.length;
            }

        } catch (error) {
            console.error(`Failed to load ${item.type} count:`, error);
        }
    }
}

function renderApplicationQueue(applications) {
    const queue = document.getElementById("applicationQueue");

    if (!queue) return;

    if (!applications.length) {
        queue.innerHTML = `
            <div class="queue-empty">
                <h3>No applications waiting</h3>
                <p>There are currently no applications in this queue.</p>
            </div>
        `;
        return;
    }

    queue.innerHTML = applications.map((app, index) => {

        const submittedAt =
            app.submitted_at ||
            app.created_at ||
            Date.now();

        const name =
            app.discord_display_name ||
            app.discord_username ||
            app.discord_id ||
            "Unknown Applicant";

        return `
            <article class="application-queue-item">

                <div class="queue-position">
                    ${index + 1}
                </div>

                <div class="queue-applicant">

                    <div class="queue-avatar">
                        ${
                            app.avatar
                                ? `<img src="https://cdn.discordapp.com/avatars/${app.discord_id}/${app.avatar}.png?size=96" alt="">`
                                : name.charAt(0).toUpperCase()
                        }
                    </div>

                    <div>
                        <h3>${name}</h3>
                        <p>
                            ${app.union_id || "No Union ID"}
                            ·
                            ${app.reference || `#${app.id}`}
                        </p>
                    </div>

                </div>

                <div class="queue-waiting">
                    <span class="${getWaitClass(submittedAt)}">
                        Waiting ${formatWaitTime(submittedAt)}
                    </span>

                    <small>
                        ${new Date(Number(submittedAt)).toLocaleString("en-GB")}
                    </small>
                </div>

                <div class="queue-status">
                    ${app.status || "Submitted"}
                </div>

                <a
                    class="queue-review-button"
                    href="review-application.html?id=${app.id}"
                >
                    Review
                </a>

            </article>
        `;
    }).join("");
}

async function openApplicationQueue(type) {
    const selectedQueue = document.getElementById("selectedQueue");
    const title = document.getElementById("selectedQueueTitle");
    const queue = document.getElementById("applicationQueue");

    if (selectedQueue) {
        selectedQueue.hidden = false;
    }

    if (title) {
        title.textContent = type;
    }

    if (queue) {
        queue.innerHTML = "<p>Loading applications...</p>";
    }

    try {
        const data = await staffFetch(
            `/api/staff/applications?type=${encodeURIComponent(type)}`
        );

        const applications = (data.applications || []).filter(app => {
            const status = String(app.status || "").toLowerCase();

            return (
                status === "submitted" ||
                status === "pending review" ||
                status === "pending"
            );
        });

        renderApplicationQueue(applications);

    } catch (error) {

        if (queue) {
            queue.innerHTML = `
                <div class="queue-empty">
                    <h3>Unable to load applications</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    const loading = document.getElementById("staffLoading");
    const denied = document.getElementById("staffDenied");
    const panel = document.getElementById("staffPanel");

    if (!window.UnionAuth) {
        if (loading) loading.hidden = true;
        if (denied) denied.hidden = false;
        return;
    }

    const user = await UnionAuth.getCurrentUser();

    if (loading) {
        loading.hidden = true;
    }

    if (!user || user.is_staff !== true) {
        if (denied) denied.hidden = false;
        return;
    }

    if (panel) {
        panel.hidden = false;
    }

    document
        .querySelectorAll(".application-section-card")
        .forEach(button => {

            button.addEventListener("click", () => {
                const type = button.dataset.type;

                if (type) {
                    openApplicationQueue(type);
                }
            });

        });

    const closeQueue =
        document.getElementById("closeQueue");

    if (closeQueue) {
        closeQueue.addEventListener("click", () => {
            const selectedQueue =
                document.getElementById("selectedQueue");

            if (selectedQueue) {
                selectedQueue.hidden = true;
            }
        });
    }

    await loadApplicationCounts();

});