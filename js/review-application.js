const REVIEW_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";

function getReviewToken() {
    return localStorage.getItem("union_session");
}

async function reviewFetch(path, options = {}) {
    const token = getReviewToken();

    if (!token) {
        throw new Error("Not logged in.");
    }

    const response = await fetch(
        `${REVIEW_API}${path}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {})
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

function getApplicationId() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return Number(params.get("id"));
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatLabel(key) {
    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}

function formatDate(timestamp) {
    if (!timestamp) return "Not available";

    return new Date(
        Number(timestamp)
    ).toLocaleString("en-GB");
}

function parseApplicationData(value) {
    try {
        const parsed =
            typeof value === "string"
                ? JSON.parse(value)
                : value;

        return (
            parsed &&
            typeof parsed === "object"
        )
            ? parsed
            : {};
    } catch {
        return {};
    }
}

function renderApplicant(app) {
    const target =
        document.getElementById(
            "reviewApplicant"
        );

    if (!target) return;

    const name =
        app.discord_display_name ||
        app.discord_username ||
        app.discord_id ||
        "Unknown Applicant";

    const avatar = app.avatar
        ? `
            <img
                src="https://cdn.discordapp.com/avatars/${app.discord_id}/${app.avatar}.png?size=128"
                alt=""
            >
        `
        : escapeHtml(
            name.charAt(0).toUpperCase()
        );

    target.innerHTML = `
        <div class="review-applicant-profile">

            <div class="review-applicant-avatar">
                ${avatar}
            </div>

            <div class="review-applicant-name">
                <h3>${escapeHtml(name)}</h3>
                <p>${escapeHtml(app.reference || `#${app.id}`)}</p>
            </div>

        </div>

        <div class="review-information-grid">

            <div>
                <span>Union ID</span>
                <strong>${escapeHtml(app.union_id || "Not assigned")}</strong>
            </div>

            <div>
                <span>Discord ID</span>
                <strong>${escapeHtml(app.discord_id)}</strong>
            </div>

            <div>
                <span>Application Type</span>
                <strong>${escapeHtml(app.application_type || "Application")}</strong>
            </div>

            <div>
                <span>Submitted</span>
                <strong>${escapeHtml(formatDate(app.submitted_at || app.created_at))}</strong>
            </div>

        </div>
    `;
}

function renderAnswers(app) {
    const target =
        document.getElementById(
            "reviewAnswers"
        );

    if (!target) return;

    const answers =
        parseApplicationData(app.data);

    const entries =
        Object.entries(answers);

    if (!entries.length) {
        target.innerHTML = `
            <div class="staff-empty-state">
                <h3>No answers found</h3>
                <p>
                    This application does not contain
                    any saved question responses.
                </p>
            </div>
        `;
        return;
    }

    target.innerHTML = entries
        .map(([key, value], index) => {

            const displayValue =
                Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "object"
                        ? JSON.stringify(
                            value,
                            null,
                            2
                        )
                        : String(value ?? "");

            return `
                <article class="review-answer">

                    <div class="review-answer-number">
                        ${index + 1}
                    </div>

                    <div>
                        <h3>
                            ${escapeHtml(formatLabel(key))}
                        </h3>

                        <p>
                            ${escapeHtml(displayValue)}
                        </p>
                    </div>

                </article>
            `;
        })
        .join("");
}

function renderStatus(app) {
    const target =
        document.getElementById(
            "reviewStatus"
        );

    if (!target) return;

    target.innerHTML = `
        <div class="review-current-status">

            <span>Current Status</span>

            <strong>
                ${escapeHtml(app.status || "Submitted")}
            </strong>

        </div>

        <div class="review-current-status">

            <span>Priority</span>

            <strong>
                ${escapeHtml(app.priority || "Normal")}
            </strong>

        </div>

        <div class="review-current-status">

            <span>Assigned Reviewer</span>

            <strong>
                ${escapeHtml(app.assigned_to || "Unassigned")}
            </strong>

        </div>
    `;
}

async function loadApplication() {
    const id = getApplicationId();

    if (!id) {
        throw new Error(
            "No application ID was provided."
        );
    }

    const data = await reviewFetch(
        `/api/staff/applications/${id}`
    );

    const app = data.application;

    const title =
        document.getElementById(
            "reviewTitle"
        );

    if (title) {
        title.textContent =
            app.application_type ||
            "Application";
    }

    renderApplicant(app);
    renderAnswers(app);
    renderStatus(app);

    return app;
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const loading =
            document.getElementById(
                "reviewLoading"
            );

        const denied =
            document.getElementById(
                "reviewDenied"
            );

        const workspace =
            document.getElementById(
                "reviewWorkspace"
            );

        try {
            if (!window.UnionAuth) {
                throw new Error(
                    "Authentication system unavailable."
                );
            }

            const user =
                await UnionAuth.getCurrentUser();

            if (
                !user ||
                user.is_staff !== true
            ) {
                if (loading) {
                    loading.hidden = true;
                }

                if (denied) {
                    denied.hidden = false;
                }

                return;
            }

            await loadApplication();

            if (loading) {
                loading.hidden = true;
            }

            if (workspace) {
                workspace.hidden = false;
            }

        } catch (error) {

            console.error(
                "Review page error:",
                error
            );

            if (loading) {
                loading.innerHTML = `
                    <h1>Unable to load application</h1>
                    <p>${escapeHtml(error.message)}</p>
                `;
            }
        }
    }
);