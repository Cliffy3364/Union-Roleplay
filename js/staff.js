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


const APPLICATION_BADGES = {
    "Whitelist Application":
        "nav-count-whitelist",

    "Staff Application":
        "nav-count-staff",

    "QA Tester Application":
        "nav-count-qa",

    "Social Media Manager Application":
        "nav-count-social",

    "Media Application":
        "nav-count-media",

    "Script Developer Application":
        "nav-count-script",

    "Vehicle Developer Application":
        "nav-count-vehicle",

    "EUP Developer Application":
        "nav-count-eup",

    "UPD Command Application":
        "nav-count-upd",

    "UHS Command Application":
        "nav-count-uhs"
};


let currentQueueType = null;

let currentQueueApplications = [];

let currentStatusFilter =
    "pending";


/* ========================================
   AUTH / API
======================================== */

function getToken() {

    return localStorage.getItem(
        "union_session"
    );
}


async function staffFetch(
    path,
    options = {}
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Not logged in."
        );
    }


    const response =
        await fetch(
            `${STAFF_API}${path}`,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
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
   STATUS HELPERS
======================================== */

function normalizeStatus(status) {

    return String(
        status || ""
    )
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


function filterApplicationsByStatus(
    applications,
    filter
) {

    switch (filter) {

        case "interview":

            return applications.filter(
                application =>
                    isInterviewStatus(
                        application.status
                    )
            );


        case "on-hold":

            return applications.filter(
                application =>
                    isOnHoldStatus(
                        application.status
                    )
            );


        case "accepted":

            return applications.filter(
                application =>
                    isAcceptedStatus(
                        application.status
                    )
            );


        case "declined":

            return applications.filter(
                application =>
                    isDeclinedStatus(
                        application.status
                    )
            );


        case "pending":

        default:

            return applications.filter(
                application =>
                    isPendingStatus(
                        application.status
                    )
            );
    }
}


/* ========================================
   GENERAL HELPERS
======================================== */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatWaitTime(timestamp) {

    if (!timestamp) {

        return "Unknown";
    }


    const value =
        Number(timestamp);


    if (
        !Number.isFinite(value)
    ) {

        return "Unknown";
    }


    const difference =
        Math.max(
            0,
            Date.now() - value
        );


    const minutes =
        Math.floor(
            difference / 60000
        );

    const hours =
        Math.floor(
            difference / 3600000
        );

    const days =
        Math.floor(
            difference / 86400000
        );


    if (days > 0) {

        return `${days}d ${hours % 24}h`;
    }


    if (hours > 0) {

        return `${hours}h ${minutes % 60}m`;
    }


    return `${minutes}m`;
}


function formatMemberDate(timestamp) {

    if (!timestamp) {

        return "Unknown";
    }


    const value =
        Number(timestamp);


    if (
        !Number.isFinite(value)
    ) {

        return "Unknown";
    }


    return new Date(value)
        .toLocaleString(
            "en-GB"
        );
}


function applicantName(app) {

    return (
        app.discord_display_name ||
        app.discord_username ||
        app.discord_id ||
        "Unknown Applicant"
    );
}


function reviewerName(app) {

    if (!app.assigned_to) {

        return "Unassigned";
    }


    return (
        app.assigned_reviewer_display_name ||
        app.assigned_reviewer_username ||
        app.assigned_to
    );
}


function memberDisplayName(member) {

    return (
        member.display_name ||
        member.discord_display_name ||
        member.discord_username ||
        member.username ||
        member.discord_id ||
        "Unknown Member"
    );
}


/* ========================================
   NAVIGATION
======================================== */

function setActiveNav(button) {

    document
        .querySelectorAll(
            ".staff-nav-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );
            }
        );


    if (button) {

        button.classList.add(
            "active"
        );
    }
}


function hideAllViews() {

    const dashboard =
        document.getElementById(
            "staffDashboardView"
        );

    const queue =
        document.getElementById(
            "staffQueueView"
        );

    const members =
        document.getElementById(
            "staffMembersView"
        );


    if (dashboard) {

        dashboard.hidden = true;
    }


    if (queue) {

        queue.hidden = true;
    }


    if (members) {

        members.hidden = true;
    }
}


function setTopSearch(
    placeholder,
    visible = true
) {

    const search =
        document.getElementById(
            "staffSearch"
        );


    if (!search) {

        return;
    }


    search.hidden =
        !visible;


    search.placeholder =
        placeholder;


    search.value = "";
}


/* ========================================
   DASHBOARD VIEW
======================================== */

function showDashboard() {

    hideAllViews();


    currentQueueType =
        null;


    const dashboard =
        document.getElementById(
            "staffDashboardView"
        );

    const title =
        document.getElementById(
            "staffPageTitle"
        );


    if (dashboard) {

        dashboard.hidden = false;
    }


    if (title) {

        title.textContent =
            "Dashboard";
    }


    setTopSearch(
        "Search applications..."
    );
}


/* ========================================
   MEMBER MANAGEMENT VIEW
======================================== */

function showMemberManagement() {

    hideAllViews();


    currentQueueType =
        null;


    const members =
        document.getElementById(
            "staffMembersView"
        );

    const title =
        document.getElementById(
            "staffPageTitle"
        );


    if (members) {

        members.hidden = false;
    }


    if (title) {

        title.textContent =
            "Member Management";
    }


    setTopSearch(
        "Search members..."
    );


    requestAnimationFrame(
        () => {

            const memberSearch =
                document.getElementById(
                    "memberSearchInput"
                );


            memberSearch?.focus();
        }
    );
}


/* ========================================
   DASHBOARD STATS
======================================== */

async function loadDashboardStats() {

    try {

        const data =
            await staffFetch(
                "/api/staff/applications/dashboard"
            );


        const summary =
            data.summary || {};


        const pending =
            document.getElementById(
                "pendingCount"
            );

        const inReview =
            document.getElementById(
                "reviewCount"
            );

        const interviews =
            document.getElementById(
                "interviewCount"
            );

        const reviewedToday =
            document.getElementById(
                "reviewedCount"
            );


        if (pending) {

            pending.textContent =
                Number(
                    summary.pending || 0
                );
        }


        if (inReview) {

            inReview.textContent =
                Number(
                    summary.in_review || 0
                );
        }


        if (interviews) {

            interviews.textContent =
                Number(
                    summary.interviews || 0
                );
        }


        if (reviewedToday) {

            reviewedToday.textContent =
                Number(
                    summary.reviewed_today || 0
                );
        }


    } catch (error) {

        console.error(
            "Failed to load staff dashboard:",
            error
        );
    }
}


/* ========================================
   APPLICATION OVERVIEW
======================================== */

async function loadApplicationOverview() {

    const overview =
        document.getElementById(
            "applicationOverview"
        );


    if (!overview) {

        return;
    }


    overview.innerHTML = `
        <p class="staff-muted">
            Loading application queues...
        </p>
    `;


    const rows = [];


    for (
        const type
        of APPLICATION_TYPES
    ) {

        try {

            const data =
                await staffFetch(
                    `/api/staff/applications?type=${encodeURIComponent(type)}`
                );


            const applications =
                data.applications || [];


            const pending =
                applications.filter(
                    application =>
                        isActiveApplication(
                            application.status
                        )
                );


            rows.push({

                type,

                count:
                    pending.length,

                oldest:
                    pending[0] ||
                    null
            });


            const badgeId =
                APPLICATION_BADGES[type];


            const badge =
                badgeId

                    ? document.getElementById(
                        badgeId
                    )

                    : null;


            if (badge) {

                badge.textContent =
                    pending.length;


                badge.classList.toggle(
                    "has-applications",
                    pending.length > 0
                );
            }


        } catch (error) {

            console.error(
                `Unable to load ${type}:`,
                error
            );


            rows.push({

                type,

                count: 0,

                oldest: null
            });
        }
    }


    rows.sort(
        (a, b) =>
            b.count - a.count
    );


    overview.innerHTML =
        rows
            .map(
                row => {

                    const oldestTime =
                        row.oldest
                            ?.submitted_at ||

                        row.oldest
                            ?.created_at;


                    return `
                        <button
                            type="button"
                            class="staff-overview-row"
                            data-overview-type="${escapeHtml(row.type)}"
                        >

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        row.type.replace(
                                            " Application",
                                            ""
                                        )
                                    )}
                                </strong>

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
                }
            )
            .join("");


    document
        .querySelectorAll(
            "[data-overview-type]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const type =
                            button.dataset
                                .overviewType;


                        if (!type) {

                            return;
                        }


                        const navButton =
                            document.querySelector(
                                `.staff-nav-item[data-type="${CSS.escape(type)}"]`
                            );


                        if (navButton) {

                            setActiveNav(
                                navButton
                            );
                        }


                        currentStatusFilter =
                            "pending";


                        resetStatusButtons();


                        await openQueue(
                            type
                        );
                    }
                );
            }
        );
}


/* ========================================
   STATUS FILTER BUTTONS
======================================== */

function resetStatusButtons() {

    document
        .querySelectorAll(
            ".staff-status-filter-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.statusFilter ===
                        "pending"
                );
            }
        );
}


/* ========================================
   APPLICATION QUEUE
======================================== */

function renderQueue(applications) {

    const queue =
        document.getElementById(
            "staffApplicationList"
        );


    if (!queue) {

        return;
    }


    if (!applications.length) {

        queue.innerHTML = `
            <div class="staff-empty-state">

                <h3>
                    Queue clear
                </h3>

                <p>
                    There are currently no applications
                    in this section.
                </p>

            </div>
        `;

        return;
    }


    queue.innerHTML =
        applications
            .map(
                (app, index) => {

                    const submitted =
                        app.submitted_at ||
                        app.created_at ||
                        Date.now();


                    const name =
                        applicantName(app);


                    const avatar =
                        app.avatar &&
                        app.discord_id

                            ? `
                                <img
                                    src="https://cdn.discordapp.com/avatars/${app.discord_id}/${app.avatar}.png?size=96"
                                    alt=""
                                >
                            `

                            : escapeHtml(
                                name
                                    .charAt(0)
                                    .toUpperCase()
                            );


                    const statusClass =
                        normalizeStatus(
                            app.status
                        )
                            .replaceAll(
                                " ",
                                "-"
                            );


                    return `
                        <article class="staff-application-row">


                            <div class="staff-queue-number">
                                ${index + 1}
                            </div>


                            <div class="staff-applicant-avatar">
                                ${avatar}
                            </div>


                            <div class="staff-applicant-info">

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                                <span>

                                    ${escapeHtml(
                                        app.union_id ||
                                        "No Union ID"
                                    )}

                                    ·

                                    ${escapeHtml(
                                        app.reference ||
                                        `#${app.id}`
                                    )}

                                    ·

                                    ${escapeHtml(
                                        formatWaitTime(
                                            submitted
                                        )
                                    )}

                                </span>

                            </div>


                            <div class="staff-application-meta">

                                <span>
                                    Status
                                </span>

                                <strong
                                    class="
                                        staff-application-status
                                        ${escapeHtml(statusClass)}
                                    "
                                >
                                    ${escapeHtml(
                                        app.status ||
                                        "Submitted"
                                    )}
                                </strong>

                            </div>


                            <div class="staff-application-meta">

                                <span>
                                    Reviewer
                                </span>

                                <strong
                                    class="
                                        staff-reviewer-name
                                        ${
                                            app.assigned_to
                                                ? ""
                                                : "unassigned"
                                        }
                                    "
                                >
                                    ${escapeHtml(
                                        reviewerName(app)
                                    )}
                                </strong>

                            </div>


                            <a
                                class="staff-review-button"
                                href="review-application.html?id=${Number(app.id)}"
                            >
                                Review
                            </a>


                        </article>
                    `;
                }
            )
            .join("");
}


/* ========================================
   OPEN APPLICATION QUEUE
======================================== */

async function openQueue(type) {

    hideAllViews();


    const queueView =
        document.getElementById(
            "staffQueueView"
        );

    const pageTitle =
        document.getElementById(
            "staffPageTitle"
        );

    const queue =
        document.getElementById(
            "staffApplicationList"
        );


    if (queueView) {

        queueView.hidden = false;
    }


    if (pageTitle) {

        pageTitle.textContent =
            type.replace(
                " Application",
                ""
            );
    }


    setTopSearch(
        "Search applications..."
    );


    if (queue) {

        queue.innerHTML = `
            <p class="staff-muted">
                Loading queue...
            </p>
        `;
    }


    try {

        const data =
            await staffFetch(
                `/api/staff/applications?type=${encodeURIComponent(type)}`
            );


        currentQueueType =
            type;


        currentQueueApplications =
            data.applications ||
            [];


        const applications =
            filterApplicationsByStatus(
                currentQueueApplications,
                currentStatusFilter
            );


        renderQueue(
            applications
        );


    } catch (error) {

        if (queue) {

            queue.innerHTML = `
                <div class="staff-empty-state">

                    <h3>
                        Unable to load queue
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message
                        )}
                    </p>

                </div>
            `;
        }
    }
}


/* ========================================
   APPLICATION SEARCH
======================================== */

function setupApplicationSearch() {

    const search =
        document.getElementById(
            "staffSearch"
        );


    if (!search) {

        return;
    }


    search.addEventListener(
        "input",
        () => {

            if (!currentQueueType) {

                return;
            }


            const queueView =
                document.getElementById(
                    "staffQueueView"
                );


            if (
                !queueView ||
                queueView.hidden
            ) {

                return;
            }


            const query =
                String(
                    search.value || ""
                )
                    .trim()
                    .toLowerCase();


            let applications =
                filterApplicationsByStatus(
                    currentQueueApplications,
                    currentStatusFilter
                );


            if (query) {

                applications =
                    applications.filter(
                        app => {

                            const searchText =
                                [
                                    applicantName(app),
                                    app.union_id,
                                    app.discord_id,
                                    app.reference,
                                    app.status,
                                    reviewerName(app)
                                ]
                                    .join(" ")
                                    .toLowerCase();


                            return searchText.includes(
                                query
                            );
                        }
                    );
            }


            renderQueue(
                applications
            );
        }
    );
}


/* ========================================
   MEMBER SEARCH RESULTS
======================================== */

function renderMemberSearchResults(
    members
) {

    const target =
        document.getElementById(
            "memberSearchResults"
        );


    if (!target) {

        return;
    }


    if (!members.length) {

        target.innerHTML = `
            <div class="member-management-empty">

                <h3>
                    No members found
                </h3>

                <p>
                    Try searching with a Union ID,
                    Discord username or Discord ID.
                </p>

            </div>
        `;

        return;
    }


    target.innerHTML =
        members
            .map(
                member => {

                    const name =
                        memberDisplayName(
                            member
                        );


                    const initial =
                        name
                            .charAt(0)
                            .toUpperCase();


                    return `
                        <button
                            type="button"
                            class="member-result-row"
                            data-member-id="${Number(member.id)}"
                        >

                            <div class="member-result-avatar">
                                ${escapeHtml(initial)}
                            </div>


                            <div class="member-result-main">

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        member.union_id ||
                                        "No Union ID"
                                    )}
                                </span>

                                <small>
                                    ${escapeHtml(
                                        member.discord_id ||
                                        "No Discord ID"
                                    )}
                                </small>

                            </div>


                            <div class="member-result-meta">

                                <span>
                                    Applications
                                </span>

                                <strong>
                                    ${Number(
                                        member.application_count ||
                                        0
                                    )}
                                </strong>

                            </div>


                            <div class="member-result-meta">

                                <span>
                                    Tickets
                                </span>

                                <strong>
                                    ${Number(
                                        member.ticket_count ||
                                        0
                                    )}
                                </strong>

                            </div>


                            <div class="member-result-open">
                                View Member →
                            </div>

                        </button>
                    `;
                }
            )
            .join("");


    target
        .querySelectorAll(
            "[data-member-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset
                                    .memberId
                            );


                        if (!id) {

                            return;
                        }


                        await loadMemberProfile(
                            id
                        );
                    }
                );
            }
        );
}


/* ========================================
   SEARCH MEMBERS
======================================== */

async function searchMembers(
    suppliedQuery = null
) {

    const input =
        document.getElementById(
            "memberSearchInput"
        );

    const button =
        document.getElementById(
            "memberSearchButton"
        );

    const target =
        document.getElementById(
            "memberSearchResults"
        );


    const query =
        String(
            suppliedQuery ??
            input?.value ??
            ""
        ).trim();


    if (!query) {

        input?.focus();

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Searching...";
    }


    if (target) {

        target.innerHTML = `
            <p class="staff-muted">
                Searching member database...
            </p>
        `;
    }


    try {

        const data =
            await staffFetch(
                `/api/staff/admin/users?q=${encodeURIComponent(query)}`
            );


        renderMemberSearchResults(
            data.users || []
        );


    } catch (error) {

        if (target) {

            target.innerHTML = `
                <div class="member-management-empty">

                    <h3>
                        Unable to search members
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Member search failed."
                        )}
                    </p>

                </div>
            `;
        }


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Search Members";
        }
    }
}


/* ========================================
   MEMBER STAFF NOTES
======================================== */

function renderMemberNotes(notes) {

    if (!notes.length) {

        return `
            <div class="member-profile-empty">

                <p>
                    No staff notes have been added
                    to this member.
                </p>

            </div>
        `;
    }


    return notes
        .map(
            note => `
                <article class="member-note">

                    <div class="member-note-header">

                        <strong>
                            ${escapeHtml(
                                note.actor_name ||
                                "Union Staff"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                formatMemberDate(
                                    note.created_at
                                )
                            )}
                        </span>

                    </div>

                    <p>
                        ${escapeHtml(
                            note.note ||
                            ""
                        )}
                    </p>

                </article>
            `
        )
        .join("");
}


/* ========================================
   LOAD MEMBER PROFILE
======================================== */

async function loadMemberProfile(
    memberId
) {

    const panel =
        document.getElementById(
            "memberProfilePanel"
        );

    const content =
        document.getElementById(
            "memberProfileContent"
        );

    const title =
        document.getElementById(
            "memberProfileName"
        );


    if (
        !panel ||
        !content
    ) {

        return;
    }


    panel.hidden = false;


    content.innerHTML = `
        <p class="staff-muted">
            Loading member profile...
        </p>
    `;


    try {

        const data =
            await staffFetch(
                `/api/staff/admin/users/${memberId}`
            );


        const member =
            data.user;


        if (!member) {

            throw new Error(
                "Member could not be found."
            );
        }


        const name =
            memberDisplayName(
                member
            );


        if (title) {

            title.textContent =
                name;
        }


        const avatar =
            member.avatar &&
            member.discord_id

                ? `
                    <img
                        src="https://cdn.discordapp.com/avatars/${member.discord_id}/${member.avatar}.png?size=128"
                        alt=""
                    >
                `

                : escapeHtml(
                    name
                        .charAt(0)
                        .toUpperCase()
                );


        content.innerHTML = `

            <div class="member-profile-header">

                <div class="member-profile-avatar">
                    ${avatar}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            member.union_id ||
                            "No Union ID"
                        )}
                    </p>

                </div>

            </div>


            <div class="member-information-grid">


                <div>

                    <span>
                        Union ID
                    </span>

                    <strong>
                        ${escapeHtml(
                            member.union_id ||
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
                            member.discord_id ||
                            "Unknown"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Discord Username
                    </span>

                    <strong>
                        ${escapeHtml(
                            member.discord_username ||
                            member.username ||
                            "Unknown"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Display Name
                    </span>

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                </div>


                <div>

                    <span>
                        Member Since
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatMemberDate(
                                member.created_at
                            )
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Database ID
                    </span>

                    <strong>
                        #${Number(member.id)}
                    </strong>

                </div>


            </div>


            <div class="member-profile-section">

                <div class="staff-section-heading">

                    <span>
                        STAFF INFORMATION
                    </span>

                    <h2>
                        Internal Notes
                    </h2>

                    <p>
                        These notes are only visible
                        to authorised staff.
                    </p>

                </div>


                <div class="member-note-form">

                    <textarea
                        id="memberStaffNote"
                        rows="4"
                        placeholder="Add an internal note about this member..."
                    ></textarea>


                    <button
                        type="button"
                        class="btn primary"
                        id="addMemberStaffNote"
                    >
                        Add Staff Note
                    </button>

                </div>


                <div
                    class="member-notes-list"
                    id="memberNotesList"
                >

                    ${renderMemberNotes(
                        data.notes || []
                    )}

                </div>

            </div>
        `;


        const noteButton =
            document.getElementById(
                "addMemberStaffNote"
            );


        if (noteButton) {

            noteButton.addEventListener(
                "click",
                async () => {

                    await addMemberStaffNote(
                        memberId
                    );
                }
            );
        }


        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        content.innerHTML = `
            <div class="member-management-empty">

                <h3>
                    Unable to load member
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Member profile could not be loaded."
                    )}
                </p>

            </div>
        `;
    }
}


/* ========================================
   ADD MEMBER STAFF NOTE
======================================== */

async function addMemberStaffNote(
    memberId
) {

    const input =
        document.getElementById(
            "memberStaffNote"
        );

    const button =
        document.getElementById(
            "addMemberStaffNote"
        );


    const note =
        String(
            input?.value || ""
        ).trim();


    if (!note) {

        input?.focus();

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Adding Note...";
    }


    try {

        await staffFetch(
            `/api/staff/admin/users/${memberId}/notes`,
            {
                method: "POST",

                body:
                    JSON.stringify({
                        note
                    })
            }
        );


        await loadMemberProfile(
            memberId
        );


    } catch (error) {

        alert(
            error.message ||
            "Unable to add staff note."
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Add Staff Note";
        }
    }
}


/* ========================================
   MEMBER MANAGEMENT EVENTS
======================================== */

function setupMemberManagement() {

    const input =
        document.getElementById(
            "memberSearchInput"
        );

    const button =
        document.getElementById(
            "memberSearchButton"
        );

    const topSearch =
        document.getElementById(
            "staffSearch"
        );


    if (button) {

        button.addEventListener(
            "click",
            async () => {

                await searchMembers();
            }
        );
    }


    if (input) {

        input.addEventListener(
            "keydown",
            async event => {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;
                }


                event.preventDefault();


                await searchMembers();
            }
        );
    }


    if (topSearch) {

        topSearch.addEventListener(
            "keydown",
            async event => {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;
                }


                const membersView =
                    document.getElementById(
                        "staffMembersView"
                    );


                if (
                    !membersView ||
                    membersView.hidden
                ) {

                    return;
                }


                const query =
                    topSearch.value
                        .trim();


                if (!query) {

                    return;
                }


                if (input) {

                    input.value =
                        query;
                }


                await searchMembers(
                    query
                );
            }
        );
    }
}


/* ========================================
   PAGE INITIALISATION
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const loading =
            document.getElementById(
                "staffLoading"
            );

        const denied =
            document.getElementById(
                "staffDenied"
            );

        const panel =
            document.getElementById(
                "staffPanel"
            );


        if (!window.UnionAuth) {

            if (loading) {

                loading.hidden = true;
            }


            if (denied) {

                denied.hidden = false;
            }


            return;
        }


        const user =
            await UnionAuth.getCurrentUser();


        if (loading) {

            loading.hidden = true;
        }


        if (
            !user ||
            user.is_staff !== true
        ) {

            if (denied) {

                denied.hidden = false;
            }


            return;
        }


        if (panel) {

            panel.hidden = false;
        }


        /* ========================================
           DASHBOARD BUTTON
        ======================================== */

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


        /* ========================================
           MEMBER MANAGEMENT BUTTON
        ======================================== */

        const memberButton =
            document.querySelector(
                '.staff-nav-item[data-view="members"]'
            );


        if (memberButton) {

            memberButton.addEventListener(
                "click",
                () => {

                    setActiveNav(
                        memberButton
                    );


                    showMemberManagement();
                }
            );
        }


        /* ========================================
           APPLICATION NAVIGATION
        ======================================== */

        document
            .querySelectorAll(
                ".staff-nav-item[data-type]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            setActiveNav(
                                button
                            );


                            currentStatusFilter =
                                "pending";


                            resetStatusButtons();


                            await openQueue(
                                button.dataset.type
                            );
                        }
                    );
                }
            );


        /* ========================================
           STATUS FILTERS
        ======================================== */

        document
            .querySelectorAll(
                ".staff-status-filter-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    ".staff-status-filter-button"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "active"
                                        );
                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            currentStatusFilter =
                                button.dataset
                                    .statusFilter ||
                                "pending";


                            const filtered =
                                filterApplicationsByStatus(
                                    currentQueueApplications,
                                    currentStatusFilter
                                );


                            renderQueue(
                                filtered
                            );
                        }
                    );
                }
            );


        setupApplicationSearch();

        setupMemberManagement();


        showDashboard();


        await loadDashboardStats();

        await loadApplicationOverview();
    }
);