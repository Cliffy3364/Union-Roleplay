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


let selectedDisciplineMember = null;
let disciplineHistoryRecords = [];


/* ==========================================================
   STAFF PERMISSIONS
========================================================== */

let currentStaffPermissions = null;

async function loadStaffPermissions() {
    try {
        const data =
            await staffFetch(
                "/api/staff/permissions"
            );

        currentStaffPermissions =
            data || null;

        return currentStaffPermissions;

    } catch (error) {

        console.error(
            "Unable to load staff permissions:",
            error
        );

        currentStaffPermissions = null;

        return null;
    }
}

function hasStaffPermission(name) {
    return (
        currentStaffPermissions?.permissions?.[name] ===
        true
    );
}

function setPermissionVisibility(
    element,
    visible
) {
    if (!element) {
        return;
    }

    element.hidden = !visible;

    element.style.display =
        visible
            ? ""
            : "none";

    element.setAttribute(
        "aria-hidden",
        visible ? "false" : "true"
    );
}

function updateStaffRankDisplay() {
    const role =
        currentStaffPermissions?.staff_role;

    if (!role) {
        return;
    }

    const statusStrong =
        document.querySelector(
            ".staff-sidebar-status strong"
        );

    if (statusStrong) {
        statusStrong.textContent =
            `${role} Access Active`;
    }

    const footerStrong =
        document.querySelector(
            ".staff-sidebar-footer strong"
        );

    if (footerStrong) {
        footerStrong.textContent =
            role;
    }
}

function applyStaffPermissions() {

    if (!currentStaffPermissions) {
        return;
    }

    /*
     * Everyone with staff access:
     * Dashboard
     * Applications
     * Rule Search
     */

    const memberNav =
        document.getElementById(
            "memberManagementNav"
        );

    const disciplineNav =
        document.getElementById(
            "staffDisciplineNav"
        );

    const recordsNav =
        document.getElementById(
            "disciplineRecordsNav"
        );

    const applicationManagementNav =
        document.getElementById(
            "applicationManagementNav"
        );

    const ruleSearchNav =
        document.getElementById(
            "ruleSearchNav"
        );


    setPermissionVisibility(
        memberNav,
        hasStaffPermission(
            "member_management"
        )
    );

    setPermissionVisibility(
        disciplineNav,
        hasStaffPermission(
            "player_discipline"
        )
    );

    setPermissionVisibility(
        recordsNav,
        hasStaffPermission(
            "disciplinary_records"
        )
    );

    setPermissionVisibility(
        applicationManagementNav,
        hasStaffPermission(
            "application_availability"
        )
    );

    setPermissionVisibility(
        ruleSearchNav,
        hasStaffPermission(
            "rule_search"
        )
    );


    /*
     * Also hide the corresponding views so manually changing
     * HTML attributes cannot reveal restricted screens.
     */

    if (
        !hasStaffPermission(
            "member_management"
        )
    ) {
        const view =
            document.getElementById(
                "staffMembersView"
            );

        if (view) {
            view.hidden = true;
        }
    }


    if (
        !hasStaffPermission(
            "player_discipline"
        )
    ) {
        const view =
            document.getElementById(
                "staffDisciplineView"
            );

        if (view) {
            view.hidden = true;
        }
    }


    if (
        !hasStaffPermission(
            "disciplinary_records"
        )
    ) {
        const view =
            document.getElementById(
                "disciplineRecordsView"
            );

        if (view) {
            view.hidden = true;
        }
    }


    if (
        !hasStaffPermission(
            "application_availability"
        )
    ) {
        const view =
            document.getElementById(
                "applicationManagementView"
            );

        if (view) {
            view.hidden = true;
        }
    }


    updateStaffRankDisplay();


    /*
     * Hide empty navigation groups after restricted items
     * have been removed.
     */

    document
        .querySelectorAll(
            ".staff-nav-group"
        )
        .forEach(group => {

            const visibleItems =
                [...group.querySelectorAll(
                    ".staff-nav-item"
                )]
                .filter(item => {

                    const style =
                        window.getComputedStyle(
                            item
                        );

                    return (
                        !item.hidden &&
                        style.display !==
                            "none"
                    );
                });

            const dropdown =
                group.querySelector(
                    ".staff-nav-dropdown"
                );

            const hasApplicationDropdown =
                dropdown !== null;

            if (
                !visibleItems.length &&
                !hasApplicationDropdown
            ) {
                group.hidden = true;
            } else {
                group.hidden = false;
            }
        });
}


let disciplineRecords = [];
let disciplineRecordsPage = 1;
let disciplineRecordsPages = 1;
let selectedGlobalDisciplineRecord = null;


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

    const discipline =
        document.getElementById(
            "staffDisciplineView"
        );


    const disciplineRecordsView =
        document.getElementById(
            "disciplineRecordsView"
        );

    const applicationManagementView =
        document.getElementById(
            "applicationManagementView"
        );

    const ruleSearchView =
        document.getElementById(
            "ruleSearchView"
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


    if (discipline) {

        discipline.hidden = true;
    }


    if (disciplineRecordsView) {

        disciplineRecordsView.hidden = true;
    }

    if (applicationManagementView) {

        applicationManagementView.hidden = true;
    }

    if (ruleSearchView) {

        ruleSearchView.hidden = true;
    }


    const staffPanel =
        document.getElementById(
            "staffPanel"
        );


    staffPanel?.classList.remove(
        "discipline-mode"
    );
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

    const description =
        document.getElementById(
            "staffPageDescription"
        );


    if (dashboard) {

        dashboard.hidden = false;
    }


    if (title) {

        title.textContent =
            "Dashboard";
    }


    if (description) {

        description.textContent =
            "Review applications and manage the Union Roleplay community.";
    }


    setTopSearch(
        "Search applications..."
    );
}


/* ========================================
   MEMBER MANAGEMENT VIEW
======================================== */

function showMemberManagement() {

    if (
        currentStaffPermissions &&
        !hasStaffPermission(
            "member_management"
        )
    ) {
        showDashboard();
        return;
    }


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

    const description =
        document.getElementById(
            "staffPageDescription"
        );


    if (members) {

        members.hidden = false;
    }


    if (title) {

        title.textContent =
            "Member Management";
    }


    if (description) {

        description.textContent =
            "Search member records, review account information and manage internal notes.";
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
   STAFF DISCIPLINE VIEW
======================================== */

function showStaffDiscipline() {

    if (
        currentStaffPermissions &&
        !hasStaffPermission(
            "player_discipline"
        )
    ) {
        showDashboard();
        return;
    }


    hideAllViews();


    currentQueueType =
        null;


    const discipline =
        document.getElementById(
            "staffDisciplineView"
        );

    const title =
        document.getElementById(
            "staffPageTitle"
        );

    const description =
        document.getElementById(
            "staffPageDescription"
        );


    if (discipline) {

        discipline.hidden = false;
    }


    document
        .getElementById(
            "staffPanel"
        )
        ?.classList.add(
            "discipline-mode"
        );


    if (title) {

        title.textContent =
            "Player Discipline";
    }


    if (description) {

        description.textContent =
            "Create and review formal disciplinary records for Union Roleplay players.";
    }


    setTopSearch(
        "",
        false
    );


    requestAnimationFrame(
        () => {

            const search =
                document.getElementById(
                    "disciplineMemberSearch"
                );


            search?.focus();
        }
    );
}



/* ========================================
   DISCIPLINARY RECORDS VIEW
======================================== */

function showDisciplinaryRecords() {

    if (
        currentStaffPermissions &&
        !hasStaffPermission(
            "disciplinary_records"
        )
    ) {
        showDashboard();
        return;
    }


    hideAllViews();

    currentQueueType = null;

    const view =
        document.getElementById(
            "disciplineRecordsView"
        );

    const title =
        document.getElementById(
            "staffPageTitle"
        );

    const description =
        document.getElementById(
            "staffPageDescription"
        );


    if (view) {
        view.hidden = false;
    }

    if (title) {
        title.textContent =
            "Disciplinary Records";
    }

    if (description) {
        description.textContent =
            "Search and review all player disciplinary records.";
    }

    setTopSearch(
        "",
        false
    );

    disciplineRecordsPage = 1;

    loadGlobalDisciplineRecords();
}


function globalDisciplinePlayerName(record) {

    return (
        record.discord_display_name ||
        record.discord_username ||
        record.username ||
        record.discord_id ||
        "Unknown Player"
    );
}


function evidenceItemsFromRecord(record) {

    try {

        const parsed =
            Array.isArray(record.evidence)
                ? record.evidence
                : JSON.parse(record.evidence || "[]");

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];
    }
}


function renderGlobalDisciplineStats(
    data
) {

    const total =
        Number(
            data.pagination?.total || 0
        );

    const counts = {};

    (data.status_counts || [])
        .forEach(row => {

            counts[
                String(row.status || "")
                    .toLowerCase()
            ] =
                Number(row.count || 0);
        });


    const totalEl =
        document.getElementById(
            "disciplineRecordsTotal"
        );

    const activeEl =
        document.getElementById(
            "disciplineRecordsActive"
        );

    const revokedEl =
        document.getElementById(
            "disciplineRecordsRevoked"
        );

    const closedEl =
        document.getElementById(
            "disciplineRecordsClosed"
        );


    if (totalEl) {
        totalEl.textContent = total;
    }

    if (activeEl) {
        activeEl.textContent =
            counts.active || 0;
    }

    if (revokedEl) {
        revokedEl.textContent =
            counts.revoked || 0;
    }

    if (closedEl) {
        closedEl.textContent =
            (counts.resolved || 0) +
            (counts.expired || 0);
    }
}


function populateDisciplineTypeFilter(
    types
) {

    const select =
        document.getElementById(
            "disciplineRecordsType"
        );

    if (!select) {
        return;
    }

    const current =
        select.value;

    select.innerHTML = `
        <option value="all">
            All Actions
        </option>

        ${(types || [])
            .map(
                type => `
                    <option value="${escapeHtml(type)}">
                        ${escapeHtml(type)}
                    </option>
                `
            )
            .join("")}
    `;

    if (
        [...select.options]
            .some(
                option =>
                    option.value === current
            )
    ) {
        select.value = current;
    }
}


function renderGlobalDisciplineRecords(
    records
) {

    const target =
        document.getElementById(
            "disciplineRecordsList"
        );

    if (!target) {
        return;
    }

    disciplineRecords =
        records || [];


    if (!disciplineRecords.length) {

        target.innerHTML = `
            <div class="member-management-empty">

                <div class="member-empty-icon">
                    DR
                </div>

                <h3>
                    No records found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>
        `;

        renderGlobalDisciplineDetail(
            null
        );

        return;
    }


    target.innerHTML =
        disciplineRecords
            .map(
                record => {

                    const details =
                        parseDisciplineOutcomeDetails(
                            record.action_taken
                        );

                    const status =
                        formatDisciplineStatus(
                            record
                        );

                    return `
                        <button
                            type="button"
                            class="discipline-global-row"
                            data-global-discipline-id="${Number(record.id)}"
                        >

                            <div class="discipline-global-main">

                                <span class="discipline-global-reference">
                                    ${escapeHtml(
                                        record.reference ||
                                        `#${record.id}`
                                    )}
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        globalDisciplinePlayerName(
                                            record
                                        )
                                    )}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        record.union_id ||
                                        "No Union ID"
                                    )}
                                    ·
                                    ${escapeHtml(
                                        record.disciplinary_type ||
                                        "Disciplinary Action"
                                    )}
                                </small>

                            </div>

                            <div class="discipline-global-meta">

                                <span>Severity</span>

                                <strong>
                                    ${escapeHtml(
                                        details.severity ||
                                        "—"
                                    )}
                                </strong>

                            </div>

                            <div class="discipline-global-meta">

                                <span>Issued By</span>

                                <strong>
                                    ${escapeHtml(
                                        record.issued_by_name ||
                                        "Union Staff"
                                    )}
                                </strong>

                            </div>

                            <div class="discipline-global-date">

                                <span>
                                    ${escapeHtml(
                                        formatMemberDate(
                                            record.issued_at
                                        )
                                    )}
                                </span>

                            </div>

                            <span
                                class="discipline-record-status ${escapeHtml(
                                    status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")
                                )}"
                            >
                                ${escapeHtml(status)}
                            </span>

                            <span class="discipline-global-open">
                                →
                            </span>

                        </button>
                    `;
                }
            )
            .join("");


    target
        .querySelectorAll(
            "[data-global-discipline-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset
                                .globalDisciplineId
                        );

                    const record =
                        disciplineRecords.find(
                            item =>
                                Number(item.id) === id
                        );

                    selectedGlobalDisciplineRecord =
                        record || null;

                    target
                        .querySelectorAll(
                            ".discipline-global-row"
                        )
                        .forEach(row =>
                            row.classList.toggle(
                                "active",
                                Number(
                                    row.dataset
                                        .globalDisciplineId
                                ) === id
                            )
                        );

                    renderGlobalDisciplineDetail(
                        record
                    );
                }
            );
        });


    if (
        selectedGlobalDisciplineRecord
    ) {

        const updated =
            disciplineRecords.find(
                item =>
                    Number(item.id) ===
                    Number(
                        selectedGlobalDisciplineRecord.id
                    )
            );

        if (updated) {
            selectedGlobalDisciplineRecord =
                updated;

            renderGlobalDisciplineDetail(
                updated
            );
        }
    }
}


function renderGlobalDisciplineDetail(
    record
) {

    const target =
        document.getElementById(
            "disciplineRecordDetail"
        );

    if (!target) {
        return;
    }


    if (!record) {

        target.innerHTML = `
            <div class="discipline-record-detail-empty">

                <div>DR</div>

                <strong>
                    Select a record
                </strong>

                <p>
                    Choose a disciplinary record to view its full details.
                </p>

            </div>
        `;

        return;
    }


    const details =
        parseDisciplineOutcomeDetails(
            record.action_taken
        );

    const evidence =
        evidenceItemsFromRecord(
            record
        );

    const status =
        formatDisciplineStatus(
            record
        );

    const canRevoke =
        status.toLowerCase() !==
        "revoked";


    target.innerHTML = `

        <div class="discipline-detail-heading">

            <div>

                <span>
                    ${escapeHtml(
                        record.reference ||
                        `#${record.id}`
                    )}
                </span>

                <h3>
                    ${escapeHtml(
                        record.disciplinary_type ||
                        "Disciplinary Action"
                    )}
                </h3>

            </div>

            <span
                class="discipline-record-status ${escapeHtml(
                    status
                        .toLowerCase()
                        .replaceAll(" ", "-")
                )}"
            >
                ${escapeHtml(status)}
            </span>

        </div>


        <div class="discipline-detail-player">

            <span>PLAYER</span>

            <strong>
                ${escapeHtml(
                    globalDisciplinePlayerName(
                        record
                    )
                )}
            </strong>

            <small>
                ${escapeHtml(
                    record.union_id ||
                    "No Union ID"
                )}
                ·
                ${escapeHtml(
                    record.discord_id ||
                    "No Discord ID"
                )}
            </small>

        </div>


        <div class="discipline-detail-grid">

            <div>
                <span>SEVERITY</span>
                <strong>
                    ${escapeHtml(
                        details.severity ||
                        "Not recorded"
                    )}
                </strong>
            </div>

            <div>
                <span>CATEGORY</span>
                <strong>
                    ${escapeHtml(
                        details.category ||
                        "Not recorded"
                    )}
                </strong>
            </div>

            <div>
                <span>PLAYER NOTIFIED</span>
                <strong>
                    ${escapeHtml(
                        details["player notified"] ||
                        "Not recorded"
                    )}
                </strong>
            </div>

            <div>
                <span>ISSUED BY</span>
                <strong>
                    ${escapeHtml(
                        record.issued_by_name ||
                        "Union Staff"
                    )}
                </strong>
            </div>

            <div>
                <span>ISSUED</span>
                <strong>
                    ${escapeHtml(
                        formatMemberDate(
                            record.issued_at
                        )
                    )}
                </strong>
            </div>

            <div>
                <span>EXPIRY / REVIEW</span>
                <strong>
                    ${record.expires_at
                        ? escapeHtml(
                            formatMemberDate(
                                record.expires_at
                            )
                        )
                        : "None"}
                </strong>
            </div>

        </div>


        <div class="discipline-detail-section">

            <span>INCIDENT SUMMARY</span>

            <p>
                ${escapeHtml(
                    record.reason ||
                    "No reason recorded."
                )}
            </p>

        </div>


        <div class="discipline-detail-section">

            <span>EVIDENCE</span>

            ${
                evidence.length
                    ? `
                        <div class="discipline-detail-evidence">

                            ${evidence
                                .map(
                                    item => `
                                        <div>
                                            ${escapeHtml(item)}
                                        </div>
                                    `
                                )
                                .join("")}

                        </div>
                    `
                    : `
                        <p class="staff-muted">
                            No evidence references recorded.
                        </p>
                    `
            }

        </div>


        ${
            details["external reference"]
                ? `
                    <div class="discipline-detail-section">

                        <span>EXTERNAL REFERENCE</span>

                        <p>
                            ${escapeHtml(
                                details[
                                    "external reference"
                                ]
                            )}
                        </p>

                    </div>
                `
                : ""
        }


        ${
            details["internal staff notes"]
                ? `
                    <div class="discipline-detail-section">

                        <span>INTERNAL STAFF NOTES</span>

                        <p>
                            ${escapeHtml(
                                details[
                                    "internal staff notes"
                                ]
                            )}
                        </p>

                    </div>
                `
                : ""
        }


        ${
            canRevoke
                ? `
                    <button
                        type="button"
                        class="discipline-revoke-button"
                        id="globalDisciplineRevoke"
                    >
                        Revoke Record
                    </button>
                `
                : ""
        }
    `;


    document
        .getElementById(
            "globalDisciplineRevoke"
        )
        ?.addEventListener(
            "click",
            async () => {

                const confirmed =
                    window.confirm(
                        "Revoke this disciplinary record? It will remain in the permanent history."
                    );

                if (!confirmed) {
                    return;
                }

                try {

                    await staffFetch(
                        `/api/staff/admin/disciplinary/${encodeURIComponent(record.id)}`,
                        {
                            method: "PATCH",

                            body:
                                JSON.stringify({
                                    status:
                                        "Revoked"
                                })
                        }
                    );

                    await loadGlobalDisciplineRecords();

                } catch (error) {

                    alert(
                        error.message ||
                        "The disciplinary record could not be revoked."
                    );
                }
            }
        );
}


function renderGlobalDisciplinePagination(
    pagination
) {

    const target =
        document.getElementById(
            "disciplineRecordsPagination"
        );

    if (!target) {
        return;
    }


    disciplineRecordsPage =
        Number(
            pagination?.page || 1
        );

    disciplineRecordsPages =
        Number(
            pagination?.pages || 1
        );


    if (
        disciplineRecordsPages <= 1
    ) {

        target.innerHTML = "";

        return;
    }


    target.innerHTML = `

        <button
            type="button"
            id="disciplineRecordsPrevious"
            ${disciplineRecordsPage <= 1 ? "disabled" : ""}
        >
            ← Previous
        </button>

        <span>
            Page
            ${disciplineRecordsPage}
            of
            ${disciplineRecordsPages}
        </span>

        <button
            type="button"
            id="disciplineRecordsNext"
            ${disciplineRecordsPage >= disciplineRecordsPages ? "disabled" : ""}
        >
            Next →
        </button>
    `;


    document
        .getElementById(
            "disciplineRecordsPrevious"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (
                    disciplineRecordsPage <= 1
                ) {
                    return;
                }

                disciplineRecordsPage--;

                await loadGlobalDisciplineRecords();
            }
        );


    document
        .getElementById(
            "disciplineRecordsNext"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (
                    disciplineRecordsPage >=
                    disciplineRecordsPages
                ) {
                    return;
                }

                disciplineRecordsPage++;

                await loadGlobalDisciplineRecords();
            }
        );
}


async function loadGlobalDisciplineRecords() {

    const target =
        document.getElementById(
            "disciplineRecordsList"
        );

    const search =
        document.getElementById(
            "disciplineRecordsSearch"
        )?.value.trim() || "";

    const status =
        document.getElementById(
            "disciplineRecordsStatus"
        )?.value || "all";

    const type =
        document.getElementById(
            "disciplineRecordsType"
        )?.value || "all";

    const issuer =
        document.getElementById(
            "disciplineRecordsIssuer"
        )?.value.trim() || "";


    if (target) {

        target.innerHTML = `
            <p class="staff-muted">
                Loading disciplinary records...
            </p>
        `;
    }


    try {

        const params =
            new URLSearchParams({
                page:
                    String(
                        disciplineRecordsPage
                    ),
                page_size:
                    "25",
                status,
                type
            });

        if (search) {
            params.set(
                "search",
                search
            );
        }

        if (issuer) {
            params.set(
                "issuer",
                issuer
            );
        }


        const data =
            await staffFetch(
                `/api/staff/admin/disciplinary?${params.toString()}`
            );


        renderGlobalDisciplineStats(
            data
        );

        populateDisciplineTypeFilter(
            data.types || []
        );

        renderGlobalDisciplineRecords(
            data.records || []
        );

        renderGlobalDisciplinePagination(
            data.pagination || {}
        );


    } catch (error) {

        if (target) {

            target.innerHTML = `
                <div class="member-management-empty">

                    <h3>
                        Unable to load records
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Disciplinary records could not be loaded."
                        )}
                    </p>

                </div>
            `;
        }
    }
}


function setupDisciplinaryRecordsManagement() {

    const search =
        document.getElementById(
            "disciplineRecordsSearch"
        );

    const status =
        document.getElementById(
            "disciplineRecordsStatus"
        );

    const type =
        document.getElementById(
            "disciplineRecordsType"
        );

    const issuer =
        document.getElementById(
            "disciplineRecordsIssuer"
        );

    const refresh =
        document.getElementById(
            "disciplineRecordsRefresh"
        );


    const reloadFromStart =
        async () => {

            disciplineRecordsPage = 1;

            selectedGlobalDisciplineRecord =
                null;

            await loadGlobalDisciplineRecords();
        };


    status?.addEventListener(
        "change",
        reloadFromStart
    );

    type?.addEventListener(
        "change",
        reloadFromStart
    );

    refresh?.addEventListener(
        "click",
        reloadFromStart
    );


    search?.addEventListener(
        "keydown",
        async event => {

            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();

            await reloadFromStart();
        }
    );


    issuer?.addEventListener(
        "keydown",
        async event => {

            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();

            await reloadFromStart();
        }
    );
}


/* ========================================
   DISCIPLINE HELPERS
======================================== */

function disciplineMemberDetails(member) {

    const parts = [];


    if (member.union_id) {

        parts.push(
            member.union_id
        );
    }


    if (member.discord_id) {

        parts.push(
            `Discord ${member.discord_id}`
        );
    }


    return parts.join(" · ") ||
        "No member identifiers available";
}


function setDisciplineMessage(
    message,
    type = "info"
) {

    const target =
        document.getElementById(
            "disciplineFormMessage"
        );


    if (!target) {

        return;
    }


    if (!message) {

        target.hidden = true;

        target.textContent = "";

        target.className =
            "discipline-form-message";

        return;
    }


    target.hidden = false;

    target.textContent =
        message;

    target.className =
        `discipline-form-message ${type}`;
}


function renderDisciplineMemberResults(
    members
) {

    const target =
        document.getElementById(
            "disciplineMemberResults"
        );


    if (!target) {

        return;
    }


    if (!members.length) {

        target.innerHTML = `
            <div class="discipline-search-empty">
                No matching players were found.
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
                            class="discipline-member-result"
                            data-discipline-member-id="${Number(member.id)}"
                        >

                            <span class="discipline-member-result-avatar">
                                ${escapeHtml(initial)}
                            </span>

                            <span class="discipline-member-result-main">

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        disciplineMemberDetails(member)
                                    )}
                                </small>

                            </span>

                            <span class="discipline-member-result-action">
                                Select →
                            </span>

                        </button>
                    `;
                }
            )
            .join("");


    target
        .querySelectorAll(
            "[data-discipline-member-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset
                                    .disciplineMemberId
                            );


                        const member =
                            members.find(
                                item =>
                                    Number(item.id) === id
                            );


                        if (!member) {

                            return;
                        }


                        await selectDisciplineMember(
                            member
                        );
                    }
                );
            }
        );
}


async function searchDisciplineMembers() {

    const input =
        document.getElementById(
            "disciplineMemberSearch"
        );

    const button =
        document.getElementById(
            "disciplineMemberSearchButton"
        );

    const target =
        document.getElementById(
            "disciplineMemberResults"
        );


    const query =
        String(
            input?.value || ""
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
                Searching staff records...
            </p>
        `;
    }


    try {

        const data =
            await staffFetch(
                `/api/staff/admin/users?q=${encodeURIComponent(query)}`
            );


        const users =
            data.users || [];


        renderDisciplineMemberResults(
            users
        );


    } catch (error) {

        if (target) {

            target.innerHTML = `
                <div class="discipline-search-empty error">
                    ${escapeHtml(
                        error.message ||
                        "Unable to search staff records."
                    )}
                </div>
            `;
        }


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Search";
        }
    }
}


async function selectDisciplineMember(
    member
) {

    selectedDisciplineMember =
        member;


    const results =
        document.getElementById(
            "disciplineMemberResults"
        );

    const selected =
        document.getElementById(
            "disciplineSelectedMember"
        );

    const name =
        document.getElementById(
            "disciplineSelectedMemberName"
        );

    const details =
        document.getElementById(
            "disciplineSelectedMemberDetails"
        );

    const avatar =
        selected?.querySelector(
            ".discipline-selected-avatar"
        );

    const memberId =
        document.getElementById(
            "disciplineMemberId"
        );


    if (results) {

        results.innerHTML = "";
    }


    if (selected) {

        selected.hidden = false;
    }


    if (name) {

        name.textContent =
            memberDisplayName(member);
    }


    if (details) {

        details.textContent =
            disciplineMemberDetails(member);
    }


    if (avatar) {

        avatar.textContent =
            memberDisplayName(member)
                .charAt(0)
                .toUpperCase();
    }


    if (memberId) {

        memberId.value =
            Number(member.id) || "";
    }


    setDisciplineMessage("");


    await loadDisciplineHistory(
        member.id
    );
}


function clearDisciplineMember() {

    selectedDisciplineMember = null;

    disciplineHistoryRecords = [];


    const selected =
        document.getElementById(
            "disciplineSelectedMember"
        );

    const memberId =
        document.getElementById(
            "disciplineMemberId"
        );

    const input =
        document.getElementById(
            "disciplineMemberSearch"
        );

    const results =
        document.getElementById(
            "disciplineMemberResults"
        );


    if (selected) {

        selected.hidden = true;
    }


    if (memberId) {

        memberId.value = "";
    }


    if (input) {

        input.value = "";
    }


    if (results) {

        results.innerHTML = "";
    }


    renderDisciplineHistory([]);


    requestAnimationFrame(
        () => input?.focus()
    );
}


function formatDisciplineAction(record) {

    return (
        record.action ||
        record.action_taken ||
        record.outcome ||
        "Disciplinary Action"
    );
}


function parseDisciplineOutcomeDetails(
    value
) {

    const result = {};

    String(value || "")
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(line => {

            const separator =
                line.indexOf(":");

            if (separator === -1) {
                return;
            }

            const key =
                line
                    .slice(0, separator)
                    .trim()
                    .toLowerCase();

            const itemValue =
                line
                    .slice(separator + 1)
                    .trim();

            result[key] =
                itemValue;
        });


    return result;
}


function formatDisciplineStatus(
    record
) {

    return String(
        record.status ||
        "Active"
    );
}


function renderDisciplineHistory(
    records
) {

    disciplineHistoryRecords =
        records || [];


    const target =
        document.getElementById(
            "disciplineHistory"
        );


    if (!target) {

        return;
    }


    if (!selectedDisciplineMember) {

        target.innerHTML = `
            <div class="discipline-empty-state">

                <div>DC</div>

                <strong>
                    No player selected
                </strong>

                <p>
                    Search for a player to view their disciplinary history.
                </p>

            </div>
        `;

        return;
    }


    if (!disciplineHistoryRecords.length) {

        target.innerHTML = `
            <div class="discipline-empty-state">

                <div>✓</div>

                <strong>
                    No disciplinary records
                </strong>

                <p>
                    No disciplinary records are currently stored for this player.
                </p>

            </div>
        `;

        return;
    }


    target.innerHTML =
        disciplineHistoryRecords
            .map(
                record => {

                    const details =
                        parseDisciplineOutcomeDetails(
                            record.action_taken
                        );

                    const status =
                        formatDisciplineStatus(
                            record
                        );

                    const evidenceCount =
                        (() => {

                            try {

                                const parsed =
                                    Array.isArray(
                                        record.evidence
                                    )
                                        ? record.evidence
                                        : JSON.parse(
                                            record.evidence ||
                                            "[]"
                                        );

                                return Array.isArray(parsed)
                                    ? parsed.length
                                    : 0;

                            } catch {

                                return 0;
                            }
                        })();

                    const canRevoke =
                        String(status)
                            .toLowerCase() !==
                        "revoked";

                    return `
                        <article
                            class="discipline-history-record"
                            data-discipline-record-id="${escapeHtml(record.id)}"
                        >

                            <div class="discipline-history-record-top">

                                <div>

                                    <span class="discipline-history-reference">
                                        ${escapeHtml(
                                            record.reference ||
                                            `Record #${record.id}`
                                        )}
                                    </span>

                                    <strong class="discipline-history-action">
                                        ${escapeHtml(
                                            record.disciplinary_type ||
                                            formatDisciplineAction(record)
                                        )}
                                    </strong>

                                </div>

                                <span class="discipline-record-status ${escapeHtml(
                                    status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")
                                )}">
                                    ${escapeHtml(status)}
                                </span>

                            </div>

                            <p>
                                ${escapeHtml(
                                    record.reason ||
                                    "No reason recorded."
                                )}
                            </p>

                            <div class="discipline-history-detail-grid">

                                <div>
                                    <span>SEVERITY</span>
                                    <strong>
                                        ${escapeHtml(
                                            details["severity"] ||
                                            "Not recorded"
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>CATEGORY</span>
                                    <strong>
                                        ${escapeHtml(
                                            details["category"] ||
                                            "Not recorded"
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>PLAYER NOTIFIED</span>
                                    <strong>
                                        ${escapeHtml(
                                            details["player notified"] ||
                                            "Not recorded"
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>EVIDENCE</span>
                                    <strong>
                                        ${evidenceCount}
                                        ${evidenceCount === 1 ? "item" : "items"}
                                    </strong>
                                </div>

                            </div>

                            <div class="discipline-history-meta">

                                <span>
                                    Issued
                                    ${escapeHtml(
                                        formatMemberDate(
                                            record.issued_at ||
                                            record.created_at
                                        )
                                    )}
                                </span>

                                <span>
                                    By
                                    ${escapeHtml(
                                        record.issued_by_name ||
                                        "Union Staff"
                                    )}
                                </span>

                            </div>

                            ${
                                details["external reference"]
                                    ? `
                                        <div class="discipline-history-reference-line">
                                            Reference:
                                            <strong>
                                                ${escapeHtml(
                                                    details["external reference"]
                                                )}
                                            </strong>
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                record.expires_at
                                    ? `
                                        <div class="discipline-history-reference-line">
                                            Expiry / Review:
                                            <strong>
                                                ${escapeHtml(
                                                    formatMemberDate(
                                                        record.expires_at
                                                    )
                                                )}
                                            </strong>
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                canRevoke
                                    ? `
                                        <button
                                            type="button"
                                            class="discipline-revoke-button"
                                            data-revoke-discipline="${escapeHtml(record.id)}"
                                        >
                                            Revoke Record
                                        </button>
                                    `
                                    : ""
                            }

                        </article>
                    `;
                }
            )
            .join("");


    target
        .querySelectorAll(
            "[data-revoke-discipline]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const recordId =
                        Number(
                            button.dataset
                                .revokeDiscipline
                        );

                    if (!recordId) {
                        return;
                    }

                    const confirmed =
                        window.confirm(
                            "Revoke this disciplinary record? The record will remain in the audit history."
                        );

                    if (!confirmed) {
                        return;
                    }

                    button.disabled = true;
                    button.textContent =
                        "Revoking...";

                    try {

                        await staffFetch(
                            `/api/staff/admin/disciplinary/${encodeURIComponent(recordId)}`,
                            {
                                method: "PATCH",
                                body: JSON.stringify({
                                    status: "Revoked"
                                })
                            }
                        );

                        await loadDisciplineHistory(
                            selectedDisciplineMember.id
                        );

                    } catch (error) {

                        alert(
                            error.message ||
                            "The disciplinary record could not be revoked."
                        );

                        button.disabled = false;
                        button.textContent =
                            "Revoke Record";
                    }
                }
            );
        });
}

async function loadDisciplineHistory(
    memberId
) {

    const target =
        document.getElementById(
            "disciplineHistory"
        );


    if (!memberId) {

        renderDisciplineHistory([]);

        return;
    }


    if (target) {

        target.innerHTML = `
            <p class="staff-muted">
                Loading disciplinary history...
            </p>
        `;
    }


    try {

        const data =
            await staffFetch(
                `/api/staff/admin/users/${encodeURIComponent(memberId)}/disciplinary`
            );


        renderDisciplineHistory(
            data.records ||
            data.discipline ||
            []
        );


    } catch (error) {

        if (target) {

            target.innerHTML = `
                <div class="discipline-empty-state error">

                    <div>
                        !
                    </div>

                    <strong>
                        History unavailable
                    </strong>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Unable to load disciplinary history."
                        )}
                    </p>

                </div>
            `;
        }
    }
}


function resetDisciplineForm(
    clearMember = false
) {

    const form =
        document.getElementById(
            "staffDisciplineForm"
        );


    form?.reset();


    if (clearMember) {

        clearDisciplineMember();
    }


    setDisciplineMessage("");
}


async function submitDisciplineRecord() {

    const form =
        document.getElementById(
            "staffDisciplineForm"
        );

    const button =
        document.getElementById(
            "disciplineSubmitButton"
        );


    if (!form) {

        return;
    }


    if (!selectedDisciplineMember) {

        setDisciplineMessage(
            "Select the player receiving this disciplinary action before submitting.",
            "error"
        );

        document
            .getElementById(
                "disciplineMemberSearch"
            )
            ?.focus();

        return;
    }


    if (!form.checkValidity()) {

        form.reportValidity();

        return;
    }


    const action =
        document.getElementById(
            "disciplineAction"
        )?.value || "";

    const severity =
        document.getElementById(
            "disciplineSeverity"
        )?.value || "";

    const category =
        document.getElementById(
            "disciplineCategory"
        )?.value || "";

    const notified =
        document.getElementById(
            "disciplineNotified"
        )?.value || "";

    const externalReference =
        document.getElementById(
            "disciplineReference"
        )?.value.trim() || "";

    const internalNotes =
        document.getElementById(
            "disciplineInternalNotes"
        )?.value.trim() || "";

    const evidenceText =
        document.getElementById(
            "disciplineEvidence"
        )?.value.trim() || "";

    const expiryValue =
        document.getElementById(
            "disciplineExpiry"
        )?.value || "";

    const evidence =
        evidenceText
            ? evidenceText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean)
            : [];

    const outcomeDetails = [
        severity ? `Severity: ${severity}` : "",
        category ? `Category: ${category}` : "",
        notified ? `Player Notified: ${notified}` : "",
        externalReference ? `External Reference: ${externalReference}` : "",
        internalNotes ? `Internal Staff Notes: ${internalNotes}` : ""
    ]
        .filter(Boolean)
        .join("\n");

    const payload = {

        disciplinary_type:
            action,

        reason:
            document.getElementById(
                "disciplineReason"
            )?.value.trim() || "",

        evidence,

        action_taken:
            outcomeDetails,

        review_at: null,

        expires_at:
            expiryValue
                ? new Date(
                    `${expiryValue}T23:59:59`
                ).getTime()
                : null
    };


    if (button) {

        button.disabled = true;

        button.textContent =
            "Submitting Record...";
    }


    setDisciplineMessage(
        "Submitting disciplinary record...",
        "info"
    );


    try {

        const data =
            await staffFetch(
                `/api/staff/admin/users/${encodeURIComponent(selectedDisciplineMember.id)}/disciplinary`,
                {
                    method: "POST",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        setDisciplineMessage(
            data.message ||
            "Disciplinary record created successfully.",
            "success"
        );


        form.reset();


        await loadDisciplineHistory(
            selectedDisciplineMember.id
        );


    } catch (error) {

        setDisciplineMessage(
            error.message ||
            "The disciplinary record could not be created.",
            "error"
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Submit Disciplinary Record";
        }
    }
}


function setupDisciplineManagement() {

    const searchInput =
        document.getElementById(
            "disciplineMemberSearch"
        );

    const searchButton =
        document.getElementById(
            "disciplineMemberSearchButton"
        );

    const changeButton =
        document.getElementById(
            "disciplineChangeMember"
        );

    const resetButton =
        document.getElementById(
            "disciplineResetButton"
        );

    const form =
        document.getElementById(
            "staffDisciplineForm"
        );


    searchButton?.addEventListener(
        "click",
        async () => {

            await searchDisciplineMembers();
        }
    );


    searchInput?.addEventListener(
        "keydown",
        async event => {

            if (event.key !== "Enter") {

                return;
            }


            event.preventDefault();

            await searchDisciplineMembers();
        }
    );


    changeButton?.addEventListener(
        "click",
        () => {

            clearDisciplineMember();
        }
    );


    resetButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            resetDisciplineForm(
                true
            );
        }
    );


    form?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await submitDisciplineRecord();
        }
    );
}



/* ==========================================================
   APPLICATION MANAGEMENT
========================================================== */

const APPLICATION_STATUS_LABELS = {
    open: "Open",
    temporarily_closed: "Temporarily Closed",
    closed: "Closed"
};

function applicationStatusLabel(status) {
    return APPLICATION_STATUS_LABELS[String(status || "").toLowerCase()] || "Open";
}

function applicationStatusClass(status) {
    return String(status || "open").toLowerCase().replaceAll("_","-");
}

function ensureApplicationManagementUI() {
    const heading = [...document.querySelectorAll(".staff-nav-heading")]
        .find(el => el.textContent.trim().toUpperCase() === "MANAGEMENT");
    const group = heading?.closest(".staff-nav-group");

    if (group && !document.getElementById("applicationManagementNav")) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "staff-nav-item";
        button.dataset.view = "application-management";
        button.id = "applicationManagementNav";
        button.innerHTML = `
            <span class="staff-nav-content">
                <span class="staff-nav-icon">AM</span>
                <span>Application Management</span>
            </span>`;
        group.appendChild(button);
    }

    const panel = document.getElementById("staffPanel");
    if (panel && !document.getElementById("applicationManagementView")) {
        const view = document.createElement("section");
        view.id = "applicationManagementView";
        view.className = "application-management-view";
        view.hidden = true;
        view.innerHTML = `
            <section class="staff-dashboard-panel application-management-panel">
                <div class="staff-panel-header">
                    <div>
                        <span>RECRUITMENT CONTROL</span>
                        <h2>Application Availability</h2>
                        <p>Open or close recruitment without editing the website. Existing submissions are not affected.</p>
                    </div>
                    <div class="staff-panel-reference">
                        <span>LIVE CONFIGURATION</span>
                        <strong>10 Application Types</strong>
                    </div>
                </div>
                <div class="staff-panel-divider"></div>
                <div id="applicationManagementMessage" class="application-management-message" hidden></div>
                <div id="applicationManagementList" class="application-management-list">
                    <div class="member-management-empty"><h3>Loading application settings...</h3></div>
                </div>
            </section>`;
        const queue = document.getElementById("staffQueueView");
        queue ? queue.insertAdjacentElement("afterend",view) : panel.appendChild(view);
    }
}

function setApplicationManagementMessage(message,type="info") {
    const el = document.getElementById("applicationManagementMessage");
    if (!el) return;
    if (!message) {
        el.hidden = true;
        el.textContent = "";
        el.className = "application-management-message";
        return;
    }
    el.hidden = false;
    el.textContent = message;
    el.className = `application-management-message ${type}`;
}

function renderApplicationManagement(rows) {
    const target = document.getElementById("applicationManagementList");
    if (!target) return;

    const map = new Map((rows || []).map(r => [r.application_type,r]));
    target.innerHTML = APPLICATION_TYPES.map((type,index) => {
        const row = map.get(type) || {status:"open"};
        const status = String(row.status || "open").toLowerCase();
        return `
            <article class="application-management-row">
                <div class="application-management-number">${String(index+1).padStart(2,"0")}</div>
                <div class="application-management-main">
                    <span>APPLICATION TYPE</span>
                    <strong>${escapeHtml(type)}</strong>
                    <small>Existing applications remain available for staff review.</small>
                </div>
                <div class="application-management-current">
                    <span>CURRENT STATUS</span>
                    <strong class="application-management-status ${escapeHtml(applicationStatusClass(status))}">
                        <span></span>${escapeHtml(applicationStatusLabel(status))}
                    </strong>
                </div>
                <div class="application-management-controls">
                    <button type="button" data-app-type="${escapeHtml(type)}" data-app-status="open" class="${status==="open"?"active open":""}">Open</button>
                    <button type="button" data-app-type="${escapeHtml(type)}" data-app-status="temporarily_closed" class="${status==="temporarily_closed"?"active temporary":""}">Temporarily Closed</button>
                    <button type="button" data-app-type="${escapeHtml(type)}" data-app-status="closed" class="${status==="closed"?"active closed":""}">Closed</button>
                </div>
            </article>`;
    }).join("");

    target.querySelectorAll("[data-app-type]").forEach(button => {
        button.addEventListener("click",() =>
            changeApplicationAvailability(
                button.dataset.appType,
                button.dataset.appStatus
            )
        );
    });
}

async function loadApplicationManagement() {
    const target = document.getElementById("applicationManagementList");
    if (target) target.innerHTML = `<div class="member-management-empty"><h3>Loading application settings...</h3><p>Reading live recruitment configuration.</p></div>`;
    try {
        const data = await staffFetch("/api/staff/applications/availability");
        renderApplicationManagement(data.applications || []);
    } catch (error) {
        if (target) target.innerHTML = `<div class="member-management-empty"><h3>Unable to load application settings</h3><p>${escapeHtml(error.message || "Request failed.")}</p></div>`;
    }
}

async function changeApplicationAvailability(applicationType,status) {
    const label = applicationStatusLabel(status);
    if (!window.confirm(`Change ${applicationType} to "${label}"?`)) return;

    document.querySelectorAll("[data-app-type]").forEach(b => b.disabled = true);
    setApplicationManagementMessage(`Updating ${applicationType}...`,"info");

    try {
        await staffFetch("/api/staff/applications/availability",{
            method:"PATCH",
            body:JSON.stringify({application_type:applicationType,status})
        });
        setApplicationManagementMessage(`${applicationType} is now ${label}.`,"success");
        await loadApplicationManagement();
    } catch (error) {
        setApplicationManagementMessage(error.message || "Status update failed.","error");
        document.querySelectorAll("[data-app-type]").forEach(b => b.disabled = false);
    }
}

function showApplicationManagement() {

    if (
        currentStaffPermissions &&
        !hasStaffPermission(
            "application_availability"
        )
    ) {
        showDashboard();
        return;
    }

    hideAllViews();
    currentQueueType = null;

    const view = document.getElementById("applicationManagementView");
    if (view) view.hidden = false;

    const title = document.getElementById("staffPageTitle");
    const description = document.getElementById("staffPageDescription");

    if (title) title.textContent = "Application Management";
    if (description) description.textContent =
        "Control which Union Roleplay applications are currently accepting submissions.";

    setTopSearch("",false);
    loadApplicationManagement();
}

function setupApplicationManagement() {
    ensureApplicationManagementUI();
    const button = document.getElementById("applicationManagementNav");
    button?.addEventListener("click",() => {
        setActiveNav(button);
        showApplicationManagement();
    });
}



/* ==========================================================
   RULE SEARCH / POSSIBLE BREACH FINDER
========================================================== */

let ruleSearchRulebookReady = false;
let ruleSearchLoadingPromise = null;

const RULE_SEARCH_STOP_WORDS = new Set([
    "a","an","and","are","as","at","be","been","being","but","by",
    "did","do","does","for","from","had","has","have","he","her",
    "him","his","i","if","in","into","is","it","its","me","my",
    "of","on","or","our","player","players","she","so","that","the",
    "their","them","then","there","they","this","to","was","we",
    "were","what","when","where","which","who","with","you","your"
]);

const RULE_SEARCH_ALIASES = {
    "01.1": [
        "racist","racism","homophobic","homophobia","transphobic",
        "transphobia","slur","slurs","hate speech","discrimination",
        "harassment","abuse"
    ],
    "01.2": [
        "ooc","out of character","arguing about rules","staff decision",
        "broke character","breaking character"
    ],
    "01.3": [
        "targeting","harassing","following player","provoking player",
        "targeted harassment"
    ],
    "01.4": [
        "dox","doxxing","real world threat","real life threat",
        "private information","address leak","ip leak"
    ],
    "01.5": [
        "trolling","troll","ruining scenes","disruptive play",
        "messing around"
    ],
    "01.7": [
        "ban evade","ban evasion","alt account","alternate account"
    ],
    "01.10": [
        "real money","real cash","paypal","selling money",
        "selling vehicle","buying money","rmt"
    ],
    "02.1": [
        "failrp","fail rp","failed roleplay","unrealistic roleplay",
        "ignored injuries","ignore injuries","didn't roleplay injuries",
        "didnt roleplay injuries","ignored crash","unrealistic"
    ],
    "02.2": [
        "broke character","out of character in scene","ooc in scene",
        "not in character"
    ],
    "02.3": [
        "metagaming","meta gaming","discord information",
        "stream information","stream sniping","outside information",
        "information character doesn't know","information character doesnt know"
    ],
    "02.4": [
        "powergaming","power gaming","forced action","forced outcome",
        "did not let respond","didn't let respond"
    ],
    "02.5": [
        "fearrp","fear rp","no fear","gun pointed","hostage no fear",
        "didn't value life","didnt value life","value of life"
    ],
    "02.6": [
        "nlr","new life rule","returned after death","came back after death",
        "returned after respawn","came back after respawn","respawn and returned"
    ],
    "02.7": [
        "combat log","combat logging","disconnected to avoid",
        "left server to avoid","quit game to avoid","alt f4"
    ],
    "02.8": [
        "rdm","random deathmatch","killed for no reason",
        "shot for no reason","attacked for no reason","no escalation shooting"
    ],
    "02.9": [
        "vdm","vehicle deathmatch","ran over for no reason",
        "rammed player","used car as weapon"
    ],
    "02.10": [
        "forced roleplay","forced rp","forced outcome","no chance to respond"
    ],
    "02.11": [
        "unrealistic escalation","escalated too quickly","minor argument shooting",
        "argument became shooting","no escalation"
    ],
    "02.12": [
        "scene interference","interfered in scene","joined random scene",
        "involved themselves in scene"
    ],
    "03.1": [
        "unrealistic driving","reckless driving","driving 120",
        "high speed everywhere","off road supercar","speeding everywhere"
    ],
    "03.2": [
        "vehicle abuse","ramming","launching vehicle","destroying vehicle",
        "crashing repeatedly"
    ],
    "03.3": [
        "mic abuse","microphone abuse","soundboard","screaming",
        "earrape","distorted mic"
    ],
    "03.4": [
        "respawn to avoid","respawned to avoid","respawned during scene",
        "died to avoid roleplay"
    ],
    "03.5": [
        "game mechanic abuse","animation abuse","menu abuse",
        "mechanic exploit","abuse mechanics"
    ],
    "03.6": [
        "unrealistic character","character behaviour","unrealistic behaviour"
    ],
    "04.2": [
        "department equipment","stole police equipment","misused police vehicle",
        "misused ambulance","department vehicle abuse"
    ],
    "04.3": [
        "sirens abuse","lights abuse","emergency vehicle abuse",
        "lights and sirens for traffic"
    ],
    "04.4": [
        "medical roleplay","ignored injuries","no injury rp",
        "didn't roleplay injury","didnt roleplay injury","walked off crash",
        "ran after crash","serious crash"
    ],
    "04.6": [
        "corrupt police","corrupt medic","unauthorised corruption",
        "corruption without approval"
    ],
    "05.1": [
        "economy abuse","money exploit","job abuse money",
        "unrealistic money","farm exploit"
    ],
    "05.2": [
        "asset transfer","gave all money","transferred vehicles",
        "large transfer","money transfer"
    ],
    "05.3": [
        "scam","scamming","ooc scam"
    ],
    "05.4": [
        "job abuse","employment abuse","employee stole","business resources"
    ],
    "05.5": [
        "property abuse","house exploit","hid in property",
        "locked player in property"
    ],
    "06.1": [
        "hospital violence","hospital trolling","fight at hospital",
        "shooting hospital"
    ],
    "06.2": [
        "police station trolling","entered police station","police facility"
    ],
    "06.3": [
        "spawn kill","spawn killing","spawn camp","spawn camping",
        "attacked at spawn"
    ],
    "06.4": [
        "restricted area","restricted location","entered restricted"
    ],
    "07.1": [
        "cheating","cheat","mod menu","aimbot","wallhack",
        "wall hack","esp"
    ],
    "07.2": [
        "exploit","exploiting","bug abuse","abused bug","dupe exploit"
    ],
    "07.3": [
        "dupe","duplication","duplicated money","duplicated item",
        "duplicated vehicle"
    ],
    "07.4": [
        "third party tool","unauthorised software","game manipulation"
    ],
    "07.5": [
        "macro","macro abuse","automated farming","auto farm"
    ],
    "07.6": [
        "didn't report exploit","didnt report exploit","kept exploit secret"
    ],
    "08.1": [
        "business inactive","not opening business","opening hours"
    ],
    "08.2": [
        "owner accountability","bad business owner","employees breaking rules"
    ],
    "08.3": [
        "business funds","drained business","stole business money",
        "business account"
    ],
    "08.4": [
        "business activity","passive income business","inactive business"
    ],
    "08.5": [
        "business rule breaches","business shutdown"
    ],
    "09.1": [
        "character consistency","character suddenly","unrealistic character skills"
    ],
    "09.2": [
        "avoid consequences","consequence avoidance","deleted character",
        "changed job to avoid","transferred assets to avoid"
    ],
    "09.3": [
        "information dumping","dumped information","revealed everything"
    ],
    "09.4": [
        "scene quality","rushed scene","only wants chase","only wants money",
        "only wants arrest","poor quality roleplay"
    ],
    "09.5": [
        "disposable character","throwaway character","character for trolling",
        "character to transfer assets"
    ],
    "09.6": [
        "ignored staff","refused staff direction","staff direction",
        "continued after staff told"
    ]
};


function ensureRuleSearchUI() {

    const playerHeading =
        [...document.querySelectorAll(
            ".staff-nav-heading"
        )]
        .find(
            heading =>
                heading.textContent
                    .trim()
                    .toUpperCase() ===
                "PLAYER MANAGEMENT"
        );

    const group =
        playerHeading
            ?.closest(
                ".staff-nav-group"
            );

    if (
        group &&
        !document.getElementById(
            "ruleSearchNav"
        )
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";
        button.className =
            "staff-nav-item";

        button.dataset.view =
            "rule-search";

        button.id =
            "ruleSearchNav";

        button.innerHTML = `
            <span class="staff-nav-content">
                <span class="staff-nav-icon">RS</span>
                <span>Rule Search</span>
            </span>
        `;

        group.appendChild(
            button
        );
    }


    const panel =
        document.getElementById(
            "staffPanel"
        );

    if (
        panel &&
        !document.getElementById(
            "ruleSearchView"
        )
    ) {

        const view =
            document.createElement(
                "section"
            );

        view.id =
            "ruleSearchView";

        view.className =
            "rule-search-view";

        view.hidden = true;

        view.innerHTML = `
            <div class="rule-search-layout">

                <section class="staff-dashboard-panel rule-search-input-panel">

                    <div class="staff-panel-header">

                        <div>
                            <span>STAFF RULE ASSISTANT</span>
                            <h2>Possible Rule Breaches</h2>
                            <p>
                                Describe what happened. The system will compare the incident
                                against the official Union Roleplay rulebook.
                            </p>
                        </div>

                        <div class="staff-panel-reference">
                            <span>DECISION SUPPORT</span>
                            <strong>Staff Review Required</strong>
                        </div>

                    </div>

                    <div class="staff-panel-divider"></div>

                    <div class="rule-search-warning">

                        <div>!</div>

                        <p>
                            Results are suggestions only. Staff must review the evidence,
                            context and full rule before issuing disciplinary action.
                        </p>

                    </div>

                    <div class="rule-search-field">

                        <label for="ruleBreachDescription">
                            INCIDENT DESCRIPTION
                        </label>

                        <textarea
                            id="ruleBreachDescription"
                            rows="8"
                            placeholder="Example: Player crashed at high speed, ignored their injuries, respawned and returned to the same scene..."
                        ></textarea>

                    </div>

                    <div class="rule-search-actions">

                        <button
                            type="button"
                            class="discipline-secondary-button"
                            id="ruleSearchClear"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            class="btn primary"
                            id="ruleSearchButton"
                        >
                            Check Rule Breaches
                        </button>

                    </div>

                </section>


                <section class="staff-dashboard-panel rule-search-results-panel">

                    <div class="staff-panel-header">

                        <div>
                            <span>SEARCH RESULTS</span>
                            <h2>Suggested Rules</h2>
                            <p id="ruleSearchResultSummary">
                                Enter an incident description to begin.
                            </p>
                        </div>

                        <button
                            type="button"
                            class="discipline-secondary-button"
                            id="ruleSearchCopyAll"
                            hidden
                        >
                            Copy All Matches
                        </button>

                    </div>

                    <div class="staff-panel-divider"></div>

                    <div id="ruleSearchResults">

                        <div class="rule-search-empty">

                            <div>RS</div>

                            <strong>
                                No incident checked
                            </strong>

                            <p>
                                Describe the incident and the possible matching rules will appear here.
                            </p>

                        </div>

                    </div>

                </section>

            </div>
        `;

        panel.appendChild(
            view
        );
    }
}


function loadRuleSearchRulebook() {

    if (
        typeof RULEBOOK !==
        "undefined"
    ) {

        ruleSearchRulebookReady = true;

        return Promise.resolve();
    }


    if (ruleSearchLoadingPromise) {

        return ruleSearchLoadingPromise;
    }


    ruleSearchLoadingPromise =
        new Promise(
            (resolve, reject) => {

                const existing =
                    document.querySelector(
                        'script[data-union-rulebook]'
                    );


                if (existing) {

                    existing.addEventListener(
                        "load",
                        () => {
                            ruleSearchRulebookReady =
                                typeof RULEBOOK !==
                                "undefined";

                            resolve();
                        },
                        {
                            once: true
                        }
                    );

                    existing.addEventListener(
                        "error",
                        reject,
                        {
                            once: true
                        }
                    );

                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "../js/rules.js";

                script.dataset.unionRulebook =
                    "true";

                script.onload =
                    () => {

                        ruleSearchRulebookReady =
                            typeof RULEBOOK !==
                            "undefined";

                        resolve();
                    };

                script.onerror =
                    () => {

                        reject(
                            new Error(
                                "The Union rulebook could not be loaded."
                            )
                        );
                    };


                document.head.appendChild(
                    script
                );
            }
        );


    return ruleSearchLoadingPromise;
}


function ruleSearchNormalize(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9.\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function ruleSearchTokens(value) {

    return ruleSearchNormalize(value)
        .split(" ")
        .filter(
            token =>
                token.length > 2 &&
                !RULE_SEARCH_STOP_WORDS.has(
                    token
                )
        );
}


function flattenedRulebook() {

    if (
        typeof RULEBOOK ===
        "undefined"
    ) {

        return [];
    }


    const flat = [];


    RULEBOOK.forEach(
        section => {

            (section.rules || [])
                .forEach(
                    rule => {

                        flat.push({
                            ...rule,

                            sectionNumber:
                                section.number,

                            sectionTitle:
                                section.title
                        });
                    }
                );
        }
    );


    return flat;
}


function scoreRuleSearchMatch(
    rule,
    incident
) {

    const query =
        ruleSearchNormalize(
            incident
        );

    const tokens =
        ruleSearchTokens(
            incident
        );

    const title =
        ruleSearchNormalize(
            rule.title
        );

    const id =
        ruleSearchNormalize(
            rule.id
        );

    const searchable =
        ruleSearchNormalize(
            [
                rule.id,
                rule.title,
                rule.punishment,
                rule.description,
                rule.enforcement,
                rule.sectionTitle
            ].join(" ")
        );

    let score = 0;
    const reasons = [];


    if (
        query.includes(id) &&
        id
    ) {

        score += 100;

        reasons.push(
            "Rule ID mentioned"
        );
    }


    if (
        title &&
        query.includes(title)
    ) {

        score += 75;

        reasons.push(
            "Rule name mentioned"
        );
    }


    const aliases =
        RULE_SEARCH_ALIASES[
            rule.id
        ] || [];


    aliases.forEach(
        alias => {

            const normalizedAlias =
                ruleSearchNormalize(
                    alias
                );

            if (
                normalizedAlias &&
                query.includes(
                    normalizedAlias
                )
            ) {

                const words =
                    normalizedAlias
                        .split(" ")
                        .length;

                score +=
                    18 +
                    Math.min(
                        words * 8,
                        30
                    );

                reasons.push(
                    `Matched "${alias}"`
                );
            }
        }
    );


    let tokenHits = 0;


    tokens.forEach(
        token => {

            if (
                searchable.includes(
                    token
                )
            ) {

                tokenHits++;

                score +=
                    token.length >= 7
                        ? 6
                        : 3;
            }
        }
    );


    if (
        tokens.length > 0
    ) {

        const coverage =
            tokenHits /
            tokens.length;

        score +=
            Math.round(
                coverage * 25
            );
    }


    return {
        rule,
        score,
        reasons:
            [...new Set(reasons)]
                .slice(0, 3)
    };
}


function ruleSearchRelevance(
    score,
    index
) {

    if (
        score >= 55 ||
        (
            index === 0 &&
            score >= 38
        )
    ) {

        return {
            label: "High relevance",
            className: "high"
        };
    }


    if (score >= 28) {

        return {
            label: "Likely match",
            className: "medium"
        };
    }


    return {
        label: "Possible relevance",
        className: "possible"
    };
}


function findPossibleRuleBreaches(
    incident
) {

    const matches =
        flattenedRulebook()
            .map(
                rule =>
                    scoreRuleSearchMatch(
                        rule,
                        incident
                    )
            )
            .filter(
                result =>
                    result.score >= 12
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );


    if (!matches.length) {

        return [];
    }


    const bestScore =
        matches[0].score;

    return matches
        .filter(
            (result, index) =>
                index < 6 &&
                (
                    result.score >= 22 ||
                    result.score >=
                        bestScore * 0.45
                )
        )
        .slice(0, 6);
}


function ruleCopyText(
    rule
) {

    return [
        `${rule.id} — ${rule.title}`,
        `Category: ${rule.sectionTitle}`,
        `Punishment: ${rule.punishment}`,
        `Rule: ${rule.description}`,
        `Enforcement: ${rule.enforcement}`
    ].join("\n");
}


async function copyRuleText(
    text,
    button = null
) {

    try {

        await navigator.clipboard
            .writeText(
                text
            );


        if (button) {

            const previous =
                button.textContent;

            button.textContent =
                "Copied ✓";

            setTimeout(
                () => {
                    button.textContent =
                        previous;
                },
                1200
            );
        }


    } catch {

        window.prompt(
            "Copy this text:",
            text
        );
    }
}


function renderRuleSearchResults(
    incident,
    matches
) {

    const target =
        document.getElementById(
            "ruleSearchResults"
        );

    const summary =
        document.getElementById(
            "ruleSearchResultSummary"
        );

    const copyAll =
        document.getElementById(
            "ruleSearchCopyAll"
        );


    if (!target) {
        return;
    }


    if (!matches.length) {

        if (summary) {
            summary.textContent =
                "No strong matches were found. Review the full rulebook manually.";
        }

        if (copyAll) {
            copyAll.hidden = true;
        }

        target.innerHTML = `
            <div class="rule-search-empty">

                <div>?</div>

                <strong>
                    No clear rule match
                </strong>

                <p>
                    Try adding more detail about what the player actually did,
                    how the scene developed and what happened afterwards.
                </p>

                <a
                    href="../rules.html"
                    target="_blank"
                    rel="noopener"
                    class="staff-review-button"
                >
                    Open Full Rulebook
                </a>

            </div>
        `;

        return;
    }


    if (summary) {

        summary.textContent =
            `${matches.length} possible ${
                matches.length === 1
                    ? "breach"
                    : "breaches"
            } found. Staff review is still required.`;
    }


    if (copyAll) {

        copyAll.hidden = false;

        copyAll.onclick =
            async () => {

                const text =
                    matches
                        .map(
                            match =>
                                ruleCopyText(
                                    match.rule
                                )
                        )
                        .join(
                            "\n\n--------------------\n\n"
                        );

                await copyRuleText(
                    text,
                    copyAll
                );
            };
    }


    target.innerHTML =
        matches
            .map(
                (match, index) => {

                    const rule =
                        match.rule;

                    const relevance =
                        ruleSearchRelevance(
                            match.score,
                            index
                        );

                    const sectionAnchor =
                        `rule-section-${rule.sectionNumber}`;

                    return `
                        <article class="rule-search-result">

                            <div class="rule-search-result-top">

                                <div class="rule-search-result-id">
                                    ${escapeHtml(rule.id)}
                                </div>

                                <div class="rule-search-result-heading">

                                    <span>
                                        ${escapeHtml(rule.sectionTitle)}
                                    </span>

                                    <h3>
                                        ${escapeHtml(rule.title)}
                                    </h3>

                                </div>

                                <span
                                    class="rule-search-relevance ${relevance.className}"
                                >
                                    ${relevance.label}
                                </span>

                            </div>


                            <div class="rule-search-result-body">

                                <div class="rule-search-result-rule">

                                    <span>
                                        RULE
                                    </span>

                                    <p>
                                        ${escapeHtml(rule.description)}
                                    </p>

                                </div>


                                <div class="rule-search-result-meta">

                                    <div>

                                        <span>
                                            PUNISHMENT
                                        </span>

                                        <strong>
                                            ${escapeHtml(rule.punishment)}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            ENFORCEMENT
                                        </span>

                                        <strong>
                                            ${escapeHtml(rule.enforcement)}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            <div class="rule-search-result-actions">

                                <button
                                    type="button"
                                    class="discipline-secondary-button"
                                    data-rule-copy="${escapeHtml(rule.id)}"
                                >
                                    Copy Rule
                                </button>

                                <a
                                    href="../rules.html#${escapeHtml(sectionAnchor)}"
                                    target="_blank"
                                    rel="noopener"
                                    class="staff-review-button"
                                >
                                    Open Full Rule
                                </a>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");


    target
        .querySelectorAll(
            "[data-rule-copy]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const ruleId =
                            button.dataset
                                .ruleCopy;

                        const match =
                            matches.find(
                                item =>
                                    item.rule.id ===
                                    ruleId
                            );

                        if (!match) {
                            return;
                        }

                        await copyRuleText(
                            ruleCopyText(
                                match.rule
                            ),
                            button
                        );
                    }
                );
            }
        );
}


async function runRuleSearch() {

    const input =
        document.getElementById(
            "ruleBreachDescription"
        );

    const button =
        document.getElementById(
            "ruleSearchButton"
        );

    const incident =
        String(
            input?.value || ""
        ).trim();


    if (
        incident.length < 10
    ) {

        input?.focus();

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Checking Rules...";
    }


    try {

        await loadRuleSearchRulebook();


        if (
            !ruleSearchRulebookReady
        ) {

            throw new Error(
                "Rulebook data is unavailable."
            );
        }


        const matches =
            findPossibleRuleBreaches(
                incident
            );


        renderRuleSearchResults(
            incident,
            matches
        );


    } catch (error) {

        const target =
            document.getElementById(
                "ruleSearchResults"
            );

        if (target) {

            target.innerHTML = `
                <div class="rule-search-empty">

                    <div>!</div>

                    <strong>
                        Rule search unavailable
                    </strong>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "The rulebook could not be checked."
                        )}
                    </p>

                </div>
            `;
        }


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Check Rule Breaches";
        }
    }
}


function showRuleSearch() {

    if (
        currentStaffPermissions &&
        !hasStaffPermission(
            "rule_search"
        )
    ) {
        showDashboard();
        return;
    }


    hideAllViews();

    currentQueueType = null;


    const view =
        document.getElementById(
            "ruleSearchView"
        );

    const title =
        document.getElementById(
            "staffPageTitle"
        );

    const description =
        document.getElementById(
            "staffPageDescription"
        );


    if (view) {

        view.hidden = false;
    }


    if (title) {

        title.textContent =
            "Rule Search";
    }


    if (description) {

        description.textContent =
            "Describe an incident and compare it against the official Union Roleplay rulebook.";
    }


    setTopSearch(
        "",
        false
    );


    loadRuleSearchRulebook()
        .catch(
            error => {

                console.warn(
                    "Rulebook preload failed:",
                    error
                );
            }
        );


    setTimeout(
        () => {

            document
                .getElementById(
                    "ruleBreachDescription"
                )
                ?.focus();
        },
        50
    );
}


function setupStaffRuleSearch() {

    ensureRuleSearchUI();


    const nav =
        document.getElementById(
            "ruleSearchNav"
        );

    const searchButton =
        document.getElementById(
            "ruleSearchButton"
        );

    const clearButton =
        document.getElementById(
            "ruleSearchClear"
        );

    const input =
        document.getElementById(
            "ruleBreachDescription"
        );


    nav?.addEventListener(
        "click",
        () => {

            setActiveNav(
                nav
            );

            showRuleSearch();
        }
    );


    searchButton?.addEventListener(
        "click",
        runRuleSearch
    );


    input?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                (
                    event.ctrlKey ||
                    event.metaKey
                )
            ) {

                event.preventDefault();

                runRuleSearch();
            }
        }
    );


    clearButton?.addEventListener(
        "click",
        () => {

            if (input) {
                input.value = "";
                input.focus();
            }

            const target =
                document.getElementById(
                    "ruleSearchResults"
                );

            const summary =
                document.getElementById(
                    "ruleSearchResultSummary"
                );

            const copyAll =
                document.getElementById(
                    "ruleSearchCopyAll"
                );


            if (summary) {

                summary.textContent =
                    "Enter an incident description to begin.";
            }


            if (copyAll) {

                copyAll.hidden = true;
            }


            if (target) {

                target.innerHTML = `
                    <div class="rule-search-empty">

                        <div>RS</div>

                        <strong>
                            No incident checked
                        </strong>

                        <p>
                            Describe the incident and the possible matching rules will appear here.
                        </p>

                    </div>
                `;
            }
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

    const pageDescription =
        document.getElementById(
            "staffPageDescription"
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


    if (pageDescription) {

        pageDescription.textContent =
            "Review, filter and manage applications in this queue.";
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


        /*
         * Load the logged-in staff member's exact permissions.
         * The Worker remains the security authority; this controls
         * what the Staff Panel displays.
         */
        await loadStaffPermissions();

        /*
         * Dynamic navigation items are created by their setup
         * functions below/alongside page initialisation.
         */
        ensureApplicationManagementUI();
        ensureRuleSearchUI();

        applyStaffPermissions();


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
           STAFF DISCIPLINE BUTTON
        ======================================== */

        const disciplineButton =
            document.querySelector(
                '.staff-nav-item[data-view="discipline"]'
            );


        if (disciplineButton) {

            disciplineButton.addEventListener(
                "click",
                () => {

                    setActiveNav(
                        disciplineButton
                    );


                    showStaffDiscipline();
                }
            );
        }



        /* ========================================
           DISCIPLINARY RECORDS BUTTON
        ======================================== */

        const disciplineRecordsButton =
            document.querySelector(
                '.staff-nav-item[data-view="discipline-records"]'
            );


        if (disciplineRecordsButton) {

            disciplineRecordsButton.addEventListener(
                "click",
                () => {

                    setActiveNav(
                        disciplineRecordsButton
                    );

                    showDisciplinaryRecords();
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

        setupDisciplineManagement();

        setupDisciplinaryRecordsManagement();

        /*
         * Re-apply after all dynamic UI has been created.
         */
        applyStaffPermissions();


        showDashboard();


        await loadDashboardStats();

        await loadApplicationOverview();
    }
);

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupApplicationManagement();

        setTimeout(
            applyStaffPermissions,
            0
        );
    }
);


/* ==========================================================
   RULE SEARCH INITIALISATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupStaffRuleSearch();

        setTimeout(
            applyStaffPermissions,
            0
        );
    }
);
