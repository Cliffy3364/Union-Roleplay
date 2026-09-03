const REVIEW_API =
    "https://the-district-api.danielclifford2808.workers.dev";


let currentApplication = null;
let currentStaffUser = null;
let pendingDecisionStatus = null;


/* ========================================
   APPLICATION QUESTION LABELS

   These match the questions in apply.js.
======================================== */

const REVIEW_QUESTION_CONFIG = {

    "Whitelist Application": {
        age: "How old are you?",
        timezone: "What is your timezone?",
        roleplayExperience:
            "Tell us about your previous roleplay experience.",
        whyUnion:
            "Why do you want to join The District?",
        scenario:
            "You are stopped by police after a pursuit. Explain how you would roleplay the situation."
    },


    "Staff Application": {
        age: "How old are you?",
        experience:
            "Do you have any previous staff experience? Tell us about it.",
        whyStaff:
            "Why do you want to join The District staff team?",
        strengths:
            "What strengths would you bring to the staff team?",
        staffScenario:
            "Two players are arguing in a staff situation and both are blaming each other. How would you handle it?"
    },


    "QA Tester Application": {
        age: "How old are you?",
        availability:
            "When are you usually available to test?",
        testingExperience:
            "Do you have any previous QA or testing experience?",
        bugReporting:
            "How would you report a bug clearly to a developer?",
        whyQa:
            "Why do you want to become a QA Tester for The District?"
    },


    "Social Media Manager Application": {
        age: "How old are you?",
        experience:
            "Describe your previous social media or FiveM media experience.",
        portfolio:
            "Provide links or details for at least three examples of your previous FiveM videos or images.",
        strategy:
            "How would you grow The District's social media accounts?",
        management:
            "How would you organise and request content from The District media team?"
    },


    "Media Application": {
        age: "How old are you?",
        experience:
            "Tell us about your previous FiveM or media experience.",
        portfolio:
            "Provide examples of your previous media work.",
        tools:
            "What editing or capture software do you use?",
        availability:
            "How often would you be available to create media for The District?"
    },


    "Streamer Application": {
        age: "How old are you?",
        channelDetails:
            "What name do you create content under, which platform or platforms do you stream on, and what are your channel links?",
        streamingExperience:
            "Tell us about your previous streaming or content creation experience, including the type of content you normally create.",
        audience:
            "Tell us about your current audience, including approximate followers and average viewers or views.",
        schedule:
            "The programme requires a minimum of 2 streams per week or 12 hours per month. Which requirement will you meet, and what would your usual streaming schedule look like?",
        serverActivity:
            "How active are you currently within The District, and how will you remain consistently active while part of the Streamer Programme?",
        disciplinaryHistory:
            "Have you had any disciplinary reports within the last month or any repeated or serious rule breaches?",
        contentStyle:
            "What type of content would you create in The District, and how would you promote the server through good-quality roleplay?",
        communityStandards:
            "How would you handle rule breaks, conflict, stream sniping or situations that could affect The District's reputation?",
        clips:
            "Provide links to at least three examples of your previous streams, clips, videos or other content.",
        whyCreator:
            "Why do you want to become a District Community Streamer, and what would you bring to the Streamer Programme?"
    },


    "Script Developer Application": {
        age: "How old are you?",
        experience:
            "Tell us about your FiveM development experience.",
        languages:
            "Which programming languages and FiveM frameworks are you comfortable with?",
        portfolio:
            "Provide examples or links to previous development work.",
        availability:
            "How much time can you normally dedicate to development each week?"
    },


    "Vehicle Developer Application": {
        age: "How old are you?",
        experience:
            "Tell us about your FiveM vehicle development experience.",
        skills:
            "What vehicle development work can you do? For example liveries, handling, metas, models or optimisation.",
        portfolio:
            "Provide examples or links to your previous vehicle work.",
        availability:
            "How often are you available to work on vehicles?"
    },


    "EUP Developer Application": {
        age: "How old are you?",
        experience:
            "Tell us about your EUP development experience.",
        skills:
            "What EUP work can you create or edit?",
        portfolio:
            "Provide examples or links to your previous EUP work.",
        availability:
            "How often are you available to work on EUP?"
    },


    "UPD Command Application": {
        age: "How old are you?",
        experience:
            "Tell us about your previous policing and command experience.",
        leadership:
            "Describe your leadership style.",
        plans:
            "What would you bring to TDPS Command?",
        standards:
            "How would you maintain high roleplay and policing standards within the department?"
    },


    "UHS Command Application": {
        age: "How old are you?",
        experience:
            "Tell us about your previous medical and command experience.",
        leadership:
            "Describe your leadership style.",
        plans:
            "What would you bring to Ambulance Command?",
        standards:
            "How would you maintain high medical roleplay and departmental standards?"
    }
};


/* ========================================
   BASIC HELPERS
======================================== */

function getReviewToken() {

    return localStorage.getItem(
        "district_session"
    );
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


function getQuestionLabel(
    applicationType,
    key
) {

    const config =
        REVIEW_QUESTION_CONFIG[
            applicationType
        ];

    if (
        config &&
        config[key]
    ) {
        return config[key];
    }

    return formatLabel(key);
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "Not available";
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
        return "Not available";
    }

    return date.toLocaleString(
        "en-GB"
    );
}


function normaliseStatus(status) {

    return String(status || "")
        .trim()
        .toLowerCase();
}


function isFinalStatus(status) {

    const value =
        normaliseStatus(status);

    return (
        value === "accepted" ||
        value === "declined"
    );
}


function isAssignedToCurrentStaff(app) {

    if (
        !app ||
        !currentStaffUser
    ) {
        return false;
    }

    return (
        String(
            app.assigned_to || ""
        ) ===
        String(
            currentStaffUser.discord_id ||
            currentStaffUser.discordId ||
            ""
        )
    );
}


function currentStaffName() {

    if (!currentStaffUser) {
        return "District Staff";
    }

    return (
        currentStaffUser.discord_display_name ||
        currentStaffUser.discordDisplayName ||
        currentStaffUser.display_name ||
        currentStaffUser.displayName ||
        currentStaffUser.discord_username ||
        currentStaffUser.username ||
        "District Staff"
    );
}


function reviewerDisplayName(app) {

    if (!app?.assigned_to) {
        return "Unassigned";
    }

    if (
        isAssignedToCurrentStaff(app)
    ) {
        return currentStaffName();
    }

    return (
        app.assigned_to_name ||
        app.assigned_reviewer_name ||
        app.reviewer_name ||
        app.assigned_to
    );
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


/* ========================================
   API
======================================== */

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


/* ========================================
   APPLICANT
======================================== */

function renderApplicant(app) {

    const target =
        document.getElementById(
            "reviewApplicant"
        );

    if (!target) {
        return;
    }

    const name =
        app.discord_display_name ||
        app.discord_username ||
        app.discord_id ||
        "Unknown Applicant";

    const avatar =
        app.avatar &&
        app.discord_id

            ? `
                <img
                    src="https://cdn.discordapp.com/avatars/${app.discord_id}/${app.avatar}.png?size=128"
                    alt=""
                >
            `

            : escapeHtml(
                name
                    .charAt(0)
                    .toUpperCase()
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

                <span>
                    District ID
                </span>

                <strong>
                    ${escapeHtml(
                        app.union_id ||
                        "Not assigned"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Discord ID
                </span>

                <strong>
                    ${escapeHtml(
                        app.discord_id ||
                        "Unknown"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Application Type
                </span>

                <strong>
                    ${escapeHtml(
                        app.application_type ||
                        "Application"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Submitted
                </span>

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


/* ========================================
   ANSWERS
======================================== */

function renderAnswers(app) {

    const target =
        document.getElementById(
            "reviewAnswers"
        );

    const counter =
        document.getElementById(
            "reviewQuestionCount"
        );

    if (!target) {
        return;
    }

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

                <h3>
                    No answers found
                </h3>

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

                    const question =
                        getQuestionLabel(
                            app.application_type,
                            key
                        );

                    return `
                        <article class="review-answer">

                            <div class="review-answer-number">
                                ${index + 1}
                            </div>

                            <div>

                                <span class="review-answer-question-label">
                                    Question ${index + 1}
                                </span>

                                <h3>
                                    ${escapeHtml(
                                        question
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


/* ========================================
   STATUS
======================================== */

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

    if (!target) {
        return;
    }

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
                    reviewerDisplayName(app)
                )}
            </strong>

        </div>
    `;
}


/* ========================================
   HEADER
======================================== */

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


/* ========================================
   REVIEW CONTROLS
======================================== */

function updateReviewControls(app) {

    if (!app) {
        return;
    }

    const status =
        normaliseStatus(
            app.status
        );

    const claimButton =
        document.getElementById(
            "claimApplication"
        );

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


    if (claimButton) {

        if (app.assigned_to) {

            claimButton.hidden = false;

            claimButton.disabled = true;

            claimButton.textContent =
                isAssignedToCurrentStaff(app)
                    ? `Claimed by ${currentStaffName()}`
                    : "Application Claimed";

        } else if (
            isFinalStatus(status)
        ) {

            claimButton.hidden = true;

        } else {

            claimButton.hidden = false;

            claimButton.disabled = false;

            claimButton.textContent =
                "Claim Application";
        }
    }


    if (
        isFinalStatus(status)
    ) {

        if (startReviewButton) {
            startReviewButton.hidden = true;
        }

        if (interviewButton) {
            interviewButton.hidden = true;
        }

        if (approveButton) {
            approveButton.hidden = true;
        }

        if (holdButton) {
            holdButton.hidden = true;
        }

        if (denyButton) {
            denyButton.hidden = true;
        }

        return;
    }


    if (startReviewButton) {

        startReviewButton.hidden =
            ![
                "",
                "submitted",
                "pending"
            ].includes(status);
    }


    if (interviewButton) {

        interviewButton.hidden =
            status === "interview";
    }


    if (approveButton) {

        approveButton.hidden =
            false;
    }


    if (holdButton) {

        holdButton.hidden =
            status === "on hold";
    }


    if (denyButton) {

        denyButton.hidden =
            false;
    }
}


/* ========================================
   NOTES
======================================== */

function renderNotes(app) {

    const target =
        document.getElementById(
            "reviewNotes"
        );

    if (!target) {
        return;
    }

    const raw =
        String(
            app.reviewer_notes || ""
        ).trim();

    if (!raw) {

        target.innerHTML = `
            <div class="review-activity-empty">

                <span class="review-activity-dot"></span>

                <div>

                    <strong>
                        No internal notes
                    </strong>

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
            .map(
                note => `
                    <div class="review-activity-empty">

                        <span class="review-activity-dot"></span>

                        <div>

                            <strong>
                                Staff Note
                            </strong>

                            <p class="staff-muted">
                                ${escapeHtml(note)}
                            </p>

                        </div>

                    </div>
                `
            )
            .join("");
}


/* ========================================
   ACTIVITY
======================================== */

function renderActivity(activity) {

    const target =
        document.getElementById(
            "reviewActivity"
        );

    if (!target) {
        return;
    }

    if (!activity.length) {

        target.innerHTML = `
            <div class="review-activity-empty">

                <span class="review-activity-dot"></span>

                <div>

                    <strong>
                        No activity yet
                    </strong>

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
            .map(
                item => {

                    const actor =
                        item.actor_name ||
                        "District Staff";

                    const action =
                        item.action ||
                        "Application updated";

                    const details =
                        item.details
                            ? `
                                <p class="staff-muted">
                                    ${escapeHtml(
                                        item.details
                                    )}
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
                }
            )
            .join("");
}


async function loadActivity() {

    const id =
        getApplicationId();

    if (!id) {
        return;
    }

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


/* ========================================
   LOAD APPLICATION
======================================== */

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

    updateReviewControls(
        currentApplication
    );

    await loadActivity();

    return currentApplication;
}


async function reloadApplication() {

    await loadApplication();
}


/* ========================================
   CLAIM APPLICATION
======================================== */

async function claimApplication() {

    const id =
        getApplicationId();

    if (
        !id ||
        !currentApplication ||
        currentApplication.assigned_to ||
        isFinalStatus(
            currentApplication.status
        )
    ) {
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


/* ========================================
   INTERNAL NOTES
======================================== */

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

    } catch (error) {

        alert(
            error.message ||
            "Unable to add internal note."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Add Internal Note";
        }
    }
}


/* ========================================
   DECISION MODAL
======================================== */

function openDecisionModal(
    status,
    title,
    description
) {

    if (
        !currentApplication ||
        isFinalStatus(
            currentApplication.status
        )
    ) {
        return;
    }

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

    pendingDecisionStatus =
        null;

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


/* ========================================
   UPDATE STATUS
======================================== */

async function updateApplicationStatus(
    status,
    staffResponse = ""
) {

    const id =
        getApplicationId();

    if (!id) {
        return;
    }

    if (
        currentApplication &&
        isFinalStatus(
            currentApplication.status
        )
    ) {

        throw new Error(
            "This application has already been closed."
        );
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


/* ========================================
   START REVIEW
======================================== */

async function startReview() {

    if (
        !currentApplication ||
        isFinalStatus(
            currentApplication.status
        )
    ) {
        return;
    }

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


/* ========================================
   CONFIRM DECISION
======================================== */

async function confirmDecision() {

    if (
        !pendingDecisionStatus ||
        !currentApplication ||
        isFinalStatus(
            currentApplication.status
        )
    ) {
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

    const requiresReason =
        (
            pendingDecisionStatus ===
                "Declined" ||

            pendingDecisionStatus ===
                "On Hold"
        );

    if (
        requiresReason &&
        !text
    ) {

        if (error) {

            error.hidden = false;

            error.textContent =
                pendingDecisionStatus ===
                    "Declined"

                    ? "A reason is required when denying an application."

                    : "A reason is required when placing an application on hold.";
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


/* ========================================
   BUTTON EVENTS
======================================== */

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
                    "Add any interview instructions or notes for the applicant. This note is optional."
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
                    "Confirm that you want to accept this application. You may add an optional note."
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
                    "A reason is required when placing an application on hold."
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
                    "A reason is required when denying an application."
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


/* ========================================
   PAGE START
======================================== */

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

            if (!window.DistrictAuth) {

                throw new Error(
                    "Authentication system unavailable."
                );
            }

            currentStaffUser =
                await DistrictAuth.getCurrentUser();

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
                    <h1>
                        Unable to load application
                    </h1>

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