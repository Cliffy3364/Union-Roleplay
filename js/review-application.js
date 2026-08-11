const REVIEW_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";

let currentApplication = null;
let currentStaffUser = null;
let pendingDecisionStatus = null;

function getReviewToken() {
    return localStorage.getItem("union_session");
}

function getApplicationId() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return Number(
        params.get("id")
    );
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
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}

function formatDate(timestamp) {
    if (!timestamp) {
        return "Not available";
    }

    return new Date(
        Number(timestamp)
    ).toLocaleString("en-GB");
}

function parseApplicationData(value) {
    if (!value) {
        return {};
    }

    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        return value;
    }

    try {
        const parsed =
            JSON.parse(value);

        return (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
        )
            ? parsed
            : {};

    } catch {
        return {};
    }
}

async function reviewFetch(
    path,
    options = {}
) {
    const token =
        getReviewToken();

    if (!token) {
        throw new Error(
            "Not logged in."
        );
    }

    const response =
        await fetch(
            `${REVIEW_API}${path}`,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
            }
        );

    let data;

    try {
        data =
            await response.json();

    } catch {

        data = {
            success: false,
            error:
                "The server returned an invalid response."
        };
    }

    if (
        !response.ok ||
        !data.success
    ) {
        throw new Error(
            data.error ||
            "Request failed."
        );
    }

    return data;
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

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <p>
                    ${escapeHtml(
                        app.reference ||
                        `#${app.id}`
                    )}
                </p>

            </div>

        </div>

        <div class="review-information-grid">

            <div>
                <span>Union ID</span>

                <strong>
                    ${escapeHtml(
                        app.union_id ||
                        "Not assigned"
                    )}
                </strong>
            </div>

            <div>
                <span>Discord ID</span>

                <strong>
                    ${escapeHtml(
                        app.discord_id ||
                        "Unknown"
                    )}
                </strong>
            </div>

            <div>
                <span>Application Type</span>

                <strong>
                    ${escapeHtml(
                        app.application_type ||
                        "Application"
                    )}
                </strong>
            </div>

            <div>
                <span>Submitted</span>

                <strong>
                    ${escapeHtml(
                        formatDate(
                            app.submitted_at ||
                            app.created_at
                        )
                    )}
                </strong>
            </div>

        </div>
    `;
}

function renderAnswers(app) {
    const target =
        document.getElementById(
            "reviewAnswers"
        );

    const counter =
        document.getElementById(
            "reviewQuestionCount"
        );

    if (!target) return;

    const answers =
        parseApplicationData(
            app.data
        );

    const entries =
        Object.entries(
            answers
        );

    if (counter) {
        counter.textContent =
            `${entries.length} ${
                entries.length === 1
                    ? "Question"
                    : "Questions"
            }`;
    }

    if (!entries.length) {
        target.innerHTML = `
            <div class="review-empty-state">

                <div class="review-empty-icon">
                    0
                </div>

                <h3>No answers found</h3>

                <p class="staff-muted">
                    This application does not contain
                    any saved responses.
                </p>

            </div>
        `;

        return;
    }

    target.innerHTML =
        entries
            .map(
                ([key, value], index) => {

                    let displayValue;

                    if (
                        Array.isArray(value)
                    ) {
                        displayValue =
                            value.join(", ");

                    } else if (
                        value &&
                        typeof value ===
                            "object"
                    ) {
                        displayValue =
                            JSON.stringify(
                                value,
                                null,
                                2
                            );

                    } else {
                        displayValue =
                            String(
                                value ?? ""
                            );
                    }

                    return `
                        <article class="review-answer">

                            <div class="review-answer-number">
                                ${index + 1}
                            </div>

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        formatLabel(key)
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        displayValue
                                    )}
                                </p>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}

function renderStatus(app) {
    const target =
        document.getElementById(
            "reviewStatus"
        );

    const headerStatus =
        document.getElementById(
            "reviewHeaderStatus"
        );

    if (headerStatus) {
        headerStatus.textContent =
            app.status ||
            "Submitted";
    }

    if (!target) return;

    target.innerHTML = `
        <div class="review-current-status">

            <span>
                Current Status
            </span>

            <strong>
                ${escapeHtml(
                    app.status ||
                    "Submitted"
                )}
            </strong>

        </div>

        <div class="review-current-status">

            <span>
                Priority
            </span>

            <strong>
                ${escapeHtml(
                    app.priority ||
                    "Normal"
                )}
            </strong>

        </div>

        <div class="review-current-status">

            <span>
                Assigned Reviewer
            </span>

            <strong>
                ${escapeHtml(
                    app.assigned_to ||
                    "Unassigned"
                )}
            </strong>

        </div>
    `;
}

function renderHeader(app) {
    const title =
        document.getElementById(
            "reviewTitle"
        );

    const reference =
        document.getElementById(
            "reviewReference"
        );

    if (title) {
        title.textContent =
            app.application_type ||
            "Application";
    }

    if (reference) {
        const referenceText =
            app.reference ||
            `#${app.id}`;

        const submitted =
            formatDate(
                app.submitted_at ||
                app.created_at
            );

        reference.textContent =
            `${referenceText} • Submitted ${submitted}`;
    }
}
function renderNotes(app) {
    const target =
        document.getElementById(
            "reviewNotes"
        );

    if (!target) return;

    const raw =
        String(
            app.reviewer_notes || ""
        ).trim();

    if (!raw) {
        target.innerHTML = `
            <div class="review-activity-empty">

                <span class="review-activity-dot"></span>

                <div>
                    <strong>No internal notes</strong>

                    <p class="staff-muted">
                        Staff notes added to this application
                        will appear here.
                    </p>
                </div>

            </div>
        `;

        return;
    }

    const notes =
        raw
            .split("\n")
            .filter(Boolean);

    target.innerHTML =
        notes
            .map(note => `
                <div class="review-activity-empty">

                    <span class="review-activity-dot"></span>

                    <div>
                        <strong>Staff Note</strong>

                        <p class="staff-muted">
                            ${escapeHtml(note)}
                        </p>
                    </div>

                </div>
            `)
            .join("");
}

function renderActivity(activity) {
    const target =
        document.getElementById(
            "reviewActivity"
        );

    if (!target) return;

    if (!activity.length) {
        target.innerHTML = `
            <div class="review-activity-empty">

                <span class="review-activity-dot"></span>

                <div>
                    <strong>No activity yet</strong>

                    <p class="staff-muted">
                        Staff actions will appear here.
                    </p>
                </div>

            </div>
        `;

        return;
    }

    target.innerHTML =
        activity
            .map(item => {

                const actor =
                    item.actor_name ||
                    "Union Staff";

                const action =
                    item.action ||
                    "Application updated";

                const details =
                    item.details
                        ? `
                            <p class="staff-muted">
                                ${escapeHtml(item.details)}
                            </p>
                        `
                        : "";

                return `
                    <div class="review-activity-empty">

                        <span class="review-activity-dot"></span>

                        <div>

                            <strong>
                                ${escapeHtml(action)}
                            </strong>

                            <p class="staff-muted">
                                ${escapeHtml(actor)}
                                •
                                ${escapeHtml(
                                    formatDate(
                                        item.created_at
                                    )
                                )}
                            </p>

                            ${details}

                        </div>

                    </div>
                `;
            })
            .join("");
}

async function loadActivity() {
    const id =
        getApplicationId();

    if (!id) return;

    try {
        const data =
            await reviewFetch(
                `/api/staff/applications/${id}/activity`
            );

        renderActivity(
            data.activity || []
        );

    } catch (error) {

        console.error(
            "Failed to load application activity:",
            error
        );
    }
}

async function loadApplication() {
    const id =
        getApplicationId();

    if (!id) {
        throw new Error(
            "No application ID was provided."
        );
    }

    const data =
        await reviewFetch(
            `/api/staff/applications/${id}`
        );

    currentApplication =
        data.application;

    if (!currentApplication) {
        throw new Error(
            "Application not found."
        );
    }

    renderHeader(
        currentApplication
    );

    renderApplicant(
        currentApplication
    );

    renderAnswers(
        currentApplication
    );

    renderStatus(
        currentApplication
    );

    renderNotes(
        currentApplication
    );

    await loadActivity();

    return currentApplication;
}

async function reloadApplication() {
    await loadApplication();
}
async function claimApplication() {
    const id =
        getApplicationId();

    if (!id) {
        return;
    }

    const button =
        document.getElementById(
            "claimApplication"
        );

    if (button) {
        button.disabled = true;
        button.textContent =
            "Claiming...";
    }

    try {
        await reviewFetch(
            `/api/staff/applications/${id}/assignment`,
            {
                method: "POST",

                body: JSON.stringify({
                    claim: true
                })
            }
        );

        await reloadApplication();

        if (button) {
            button.textContent =
                "Application Claimed";
        }

        await loadActivity();

    } catch (error) {

        alert(
            error.message ||
            "Unable to claim application."
        );

        if (button) {
            button.disabled = false;
            button.textContent =
                "Claim Application";
        }
    }
}

async function addInternalNote() {
    const id =
        getApplicationId();

    const input =
        document.getElementById(
            "staffNote"
        );

    const button =
        document.getElementById(
            "saveStaffNote"
        );

    if (
        !id ||
        !input
    ) {
        return;
    }

    const note =
        input.value.trim();

    if (!note) {
        input.focus();
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent =
            "Adding Note...";
    }

    try {
        await reviewFetch(
            `/api/staff/applications/${id}/notes`,
            {
                method: "POST",

                body: JSON.stringify({
                    note
                })
            }
        );

        input.value = "";

        await reloadApplication();

        if (button) {
            button.disabled = false;
            button.textContent =
                "Add Internal Note";
        }

    } catch (error) {

        alert(
            error.message ||
            "Unable to add internal note."
        );

        if (button) {
            button.disabled = false;
            button.textContent =
                "Add Internal Note";
        }
    }
}
function openDecisionModal(
    status,
    title,
    description
) {
    pendingDecisionStatus =
        status;

    const modal =
        document.getElementById(
            "reviewDecisionModal"
        );

    const modalTitle =
        document.getElementById(
            "decisionModalTitle"
        );

    const modalDescription =
        document.getElementById(
            "decisionModalDescription"
        );

    const reason =
        document.getElementById(
            "decisionReason"
        );

    const error =
        document.getElementById(
            "decisionModalError"
        );

    if (modalTitle) {
        modalTitle.textContent =
            title;
    }

    if (modalDescription) {
        modalDescription.textContent =
            description;
    }

    if (reason) {
        reason.value = "";
    }

    if (error) {
        error.hidden = true;
        error.textContent = "";
    }

    if (modal) {
        modal.hidden = false;
    }
}

function closeDecisionModal() {
    pendingDecisionStatus = null;

    const modal =
        document.getElementById(
            "reviewDecisionModal"
        );

    const reason =
        document.getElementById(
            "decisionReason"
        );

    const error =
        document.getElementById(
            "decisionModalError"
        );

    if (reason) {
        reason.value = "";
    }

    if (error) {
        error.hidden = true;
        error.textContent = "";
    }

    if (modal) {
        modal.hidden = true;
    }
}

async function updateApplicationStatus(
    status,
    staffResponse = ""
) {
    const id =
        getApplicationId();

    if (!id) {
        return;
    }

    const data =
        await reviewFetch(
            `/api/staff/applications/${id}/review`,
            {
                method: "POST",

                body: JSON.stringify({
                    status,
                    staff_response:
                        staffResponse,
                    reviewer_notes:
                        currentApplication
                            ?.reviewer_notes ||
                        "",
                    priority:
                        currentApplication
                            ?.priority ||
                        "Normal"
                })
            }
        );

    currentApplication =
        data.application;

    await reloadApplication();
}

async function startReview() {
    try {
        await updateApplicationStatus(
            "Pending Review",
            "Application review started."
        );

    } catch (error) {

        alert(
            error.message ||
            "Unable to start review."
        );
    }
}

async function confirmDecision() {
    if (!pendingDecisionStatus) {
        return;
    }

    const button =
        document.getElementById(
            "confirmDecision"
        );

    const reason =
        document.getElementById(
            "decisionReason"
        );

    const error =
        document.getElementById(
            "decisionModalError"
        );

    const text =
        String(
            reason?.value || ""
        ).trim();

    if (
        pendingDecisionStatus ===
            "Declined" &&
        !text
    ) {
        if (error) {
            error.hidden = false;
            error.textContent =
                "A reason is required when denying an application.";
        }

        reason?.focus();

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent =
            "Saving...";
    }

    try {
        await updateApplicationStatus(
            pendingDecisionStatus,
            text
        );

        closeDecisionModal();

    } catch (requestError) {

        if (error) {
            error.hidden = false;
            error.textContent =
                requestError.message ||
                "Unable to update application.";
        }

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent =
                "Confirm";
        }
    }
}

function setupDecisionButtons() {
    const startReviewButton =
        document.getElementById(
            "startReviewApplication"
        );

    const interviewButton =
        document.getElementById(
            "interviewApplication"
        );

    const approveButton =
        document.getElementById(
            "approveApplication"
        );

    const holdButton =
        document.getElementById(
            "holdApplication"
        );

    const denyButton =
        document.getElementById(
            "denyApplication"
        );

    const closeButton =
        document.getElementById(
            "closeDecisionModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelDecisionModal"
        );

    const confirmButton =
        document.getElementById(
            "confirmDecision"
        );

    if (startReviewButton) {
        startReviewButton.addEventListener(
            "click",
            startReview
        );
    }

    if (interviewButton) {
        interviewButton.addEventListener(
            "click",
            () => {
                openDecisionModal(
                    "Interview",
                    "Move to Interview",
                    "Add any interview instructions or notes for the applicant."
                );
            }
        );
    }

    if (approveButton) {
        approveButton.addEventListener(
            "click",
            () => {
                openDecisionModal(
                    "Accepted",
                    "Accept Application",
                    "Confirm that you want to accept this application."
                );
            }
        );
    }

    if (holdButton) {
        holdButton.addEventListener(
            "click",
            () => {
                openDecisionModal(
                    "On Hold",
                    "Put Application On Hold",
                    "Add a note explaining why this application is being placed on hold."
                );
            }
        );
    }

    if (denyButton) {
        denyButton.addEventListener(
            "click",
            () => {
                openDecisionModal(
                    "Declined",
                    "Deny Application",
                    "A reason is required. This will be recorded against the application."
                );
            }
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeDecisionModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeDecisionModal
        );
    }

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            confirmDecision
        );
    }
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

        const claimButton =
            document.getElementById(
                "claimApplication"
            );

        const noteButton =
            document.getElementById(
                "saveStaffNote"
            );

        try {
            if (!window.UnionAuth) {
                throw new Error(
                    "Authentication system unavailable."
                );
            }

            currentStaffUser =
                await UnionAuth.getCurrentUser();

            if (
                !currentStaffUser ||
                currentStaffUser.is_staff !== true
            ) {
                if (loading) {
                    loading.hidden = true;
                }

                if (denied) {
                    denied.hidden = false;
                }

                return;
            }

            setupDecisionButtons();

            if (claimButton) {
                claimButton.addEventListener(
                    "click",
                    claimApplication
                );
            }

            if (noteButton) {
                noteButton.addEventListener(
                    "click",
                    addInternalNote
                );
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

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "An unknown error occurred."
                        )}
                    </p>
                `;
            }
        }
    }
);