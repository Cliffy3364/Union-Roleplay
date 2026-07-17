"use strict";

/* ================================= */
/* APPLICATIONS PAGE */
/* ================================= */

document.addEventListener("DOMContentLoaded", () => {

    const applicationCards = Array.from(
        document.querySelectorAll(".application-card")
    );

    const searchInput = document.getElementById(
        "applicationsSearch"
    );

    const statusFilter = document.getElementById(
        "applicationsStatusFilter"
    );

    const typeFilter = document.getElementById(
        "applicationsTypeFilter"
    );

    const clearFiltersButton = document.getElementById(
        "applicationsClearFilters"
    );

    const emptyState = document.getElementById(
        "applicationsEmptyState"
    );

    const emptyStateResetButton = document.getElementById(
        "applicationsEmptyReset"
    );

    const detailsModal = document.getElementById(
        "applicationDetailsModal"
    );

    const withdrawModal = document.getElementById(
        "applicationWithdrawModal"
    );

    const toast = document.getElementById(
        "applicationToast"
    );

    const toastTitle = document.getElementById(
        "applicationToastTitle"
    );

    const toastMessage = document.getElementById(
        "applicationToastMessage"
    );

    const toastCloseButton = document.getElementById(
        "applicationToastClose"
    );

    const previousPageButton = document.getElementById(
        "applicationsPreviousPage"
    );

    const nextPageButton = document.getElementById(
        "applicationsNextPage"
    );

    const paginationButtons = Array.from(
        document.querySelectorAll(
            "#applicationsPaginationPages button"
        )
    );

    const confirmWithdrawButton = document.getElementById(
        "applicationConfirmWithdraw"
    );

    const withdrawReference = document.getElementById(
        "applicationWithdrawReference"
    );

    const withdrawReason = document.getElementById(
        "applicationWithdrawReason"
    );

    let currentPage = 1;
    let activeApplicationCard = null;
    let toastTimeout = null;

    const applicationsPerPage = 4;


    /* ================================= */
    /* APPLICATION DATA */
    /* ================================= */

    const applicationData = {

        whitelist: {
            title: "Whitelist Application",
            type: "WHITELIST APPLICATION",
            reference: "URP-WL-0001",
            submitted: "12 July 2026",
            updated: "14 July 2026",
            team: "Whitelist Team",
            status: "In review",
            statusClass: "review",
            progress: 60,
            comments: [
                {
                    author: "Whitelist Team",
                    date: "14 July 2026",
                    message:
                        "Your application has been assigned to a reviewer. No action is currently required."
                },
                {
                    author: "Application System",
                    date: "12 July 2026",
                    message:
                        "Your whitelist application was submitted successfully."
                }
            ],
            answers: [
                {
                    question:
                        "Why do you want to join Union Roleplay?",
                    answer:
                        "I want to join a serious British roleplay community focused on realistic, immersive and character-driven stories."
                },
                {
                    question:
                        "What experience do you have?",
                    answer:
                        "I have experience playing economy-based roleplay servers and understand the importance of remaining in character."
                },
                {
                    question:
                        "Describe your intended character.",
                    answer:
                        "My character will be a working-class resident who wants to build a legitimate business while slowly developing relationships across the city."
                }
            ],
            timeline: [
                {
                    number: "✓",
                    title: "Submitted",
                    description:
                        "Application received successfully.",
                    state: "complete"
                },
                {
                    number: "02",
                    title: "Staff review",
                    description:
                        "Your answers are currently being reviewed.",
                    state: "current"
                },
                {
                    number: "03",
                    title: "Decision",
                    description:
                        "A final decision has not yet been made.",
                    state: ""
                }
            ]
        },

        police: {
            title: "Union City Police Application",
            type: "POLICE APPLICATION",
            reference: "URP-POL-0024",
            submitted: "10 July 2026",
            updated: "15 July 2026",
            team: "Police Recruitment",
            status: "Interview",
            statusClass: "interview",
            progress: 80,
            comments: [
                {
                    author: "Police Recruitment",
                    date: "15 July 2026",
                    message:
                        "Your written application has passed review. Please check Discord for interview arrangements."
                },
                {
                    author: "Police Recruitment",
                    date: "11 July 2026",
                    message:
                        "Your application entered the recruitment review queue."
                }
            ],
            answers: [
                {
                    question:
                        "Why do you want to join Union City Police?",
                    answer:
                        "I want to contribute to structured police roleplay and help create realistic and enjoyable interactions for the community."
                },
                {
                    question:
                        "How would you handle a difficult suspect?",
                    answer:
                        "I would remain calm, communicate clearly, follow procedure and only escalate when proportionate and necessary."
                },
                {
                    question:
                        "What qualities would you bring?",
                    answer:
                        "Patience, good communication, professionalism and a willingness to learn from more experienced officers."
                }
            ],
            timeline: [
                {
                    number: "✓",
                    title: "Submitted",
                    description:
                        "Application received successfully.",
                    state: "complete"
                },
                {
                    number: "✓",
                    title: "Written review",
                    description:
                        "Your written answers passed staff review.",
                    state: "complete"
                },
                {
                    number: "03",
                    title: "Interview",
                    description:
                        "An interview is being arranged through Discord.",
                    state: "current"
                },
                {
                    number: "04",
                    title: "Final decision",
                    description:
                        "A decision will be made after your interview.",
                    state: ""
                }
            ]
        }

    };


    /* ================================= */
    /* HELPERS */
    /* ================================= */

    function normaliseText(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }

    function getCardValue(card, key) {

        return normaliseText(
            card.dataset[key]
        );

    }

    function getVisibleFilteredCards() {

        const searchTerm = normaliseText(
            searchInput?.value
        );

        const selectedStatus = normaliseText(
            statusFilter?.value
        );

        const selectedType = normaliseText(
            typeFilter?.value
        );

        return applicationCards.filter((card) => {

            if (card.classList.contains("is-withdrawn")) {
                return false;
            }

            const searchableText = normaliseText(
                [
                    card.dataset.title,
                    card.dataset.reference,
                    card.dataset.type,
                    card.dataset.status,
                    card.textContent
                ].join(" ")
            );

            const matchesSearch =
                !searchTerm ||
                searchableText.includes(searchTerm);

            const matchesStatus =
                !selectedStatus ||
                selectedStatus === "all" ||
                getCardValue(card, "status") === selectedStatus;

            const matchesType =
                !selectedType ||
                selectedType === "all" ||
                getCardValue(card, "type") === selectedType;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );

        });

    }

    function getTotalPages(filteredCards) {

        return Math.max(
            1,
            Math.ceil(
                filteredCards.length /
                applicationsPerPage
            )
        );

    }


    /* ================================= */
    /* FILTERING + PAGINATION */
    /* ================================= */

    function renderApplications() {

        const filteredCards =
            getVisibleFilteredCards();

        const totalPages =
            getTotalPages(filteredCards);

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const pageStart =
            (currentPage - 1) *
            applicationsPerPage;

        const pageEnd =
            pageStart +
            applicationsPerPage;

        applicationCards.forEach((card) => {

            card.hidden = true;

        });

        filteredCards
            .slice(pageStart, pageEnd)
            .forEach((card) => {

                card.hidden = false;

            });

        if (emptyState) {

            emptyState.hidden =
                filteredCards.length !== 0;

        }

        updatePagination(
            totalPages,
            filteredCards.length
        );

    }

    function updatePagination(
        totalPages,
        resultCount
    ) {

        if (previousPageButton) {

            previousPageButton.disabled =
                currentPage <= 1 ||
                resultCount === 0;

        }

        if (nextPageButton) {

            nextPageButton.disabled =
                currentPage >= totalPages ||
                resultCount === 0;

        }

        paginationButtons.forEach(
            (button, index) => {

                const pageNumber =
                    index + 1;

                button.hidden =
                    pageNumber > totalPages;

                button.classList.toggle(
                    "active",
                    pageNumber === currentPage
                );

                if (pageNumber === currentPage) {

                    button.setAttribute(
                        "aria-current",
                        "page"
                    );

                } else {

                    button.removeAttribute(
                        "aria-current"
                    );

                }

            }
        );

    }

    function resetFilters() {

        if (searchInput) {
            searchInput.value = "";
        }

        if (statusFilter) {
            statusFilter.value = "all";
        }

        if (typeFilter) {
            typeFilter.value = "all";
        }

        currentPage = 1;

        renderApplications();

    }


    /* ================================= */
    /* DETAILS MODAL */
    /* ================================= */

    function openDetailsModal(card) {

        if (!detailsModal || !card) {
            return;
        }

        activeApplicationCard = card;

        const dataKey =
            card.dataset.application;

        const data =
            applicationData[dataKey];

        if (data) {
            populateDetailsModal(data);
        }

        openModal(detailsModal);

    }

    function populateDetailsModal(data) {

        setText(
            "applicationModalType",
            data.type
        );

        setText(
            "applicationModalTitle",
            data.title
        );

        setText(
            "applicationModalReference",
            data.reference
        );

        setText(
            "applicationModalSubmitted",
            data.submitted
        );

        setText(
            "applicationModalUpdated",
            data.updated
        );

        setText(
            "applicationModalTeam",
            data.team
        );

        const statusElement =
            document.getElementById(
                "applicationModalStatus"
            );

        if (statusElement) {

            statusElement.textContent =
                data.status;

            statusElement.className =
                `application-status-badge ${data.statusClass}`;

        }

        setText(
            "applicationModalProgressText",
            `${data.progress}%`
        );

        const progressBar =
            document.getElementById(
                "applicationModalProgressBar"
            );

        if (progressBar) {

            progressBar.style.width =
                `${data.progress}%`;

        }

        renderModalTimeline(
            data.timeline
        );

        renderModalComments(
            data.comments
        );

        renderModalAnswers(
            data.answers
        );

    }

    function renderModalTimeline(items) {

        const container =
            document.getElementById(
                "applicationModalTimeline"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        items.forEach((item) => {

            const article =
                document.createElement("article");

            if (item.state) {
                article.classList.add(item.state);
            }

            const marker =
                document.createElement("span");

            marker.textContent =
                item.number;

            const content =
                document.createElement("div");

            const title =
                document.createElement("strong");

            title.textContent =
                item.title;

            const description =
                document.createElement("p");

            description.textContent =
                item.description;

            content.append(
                title,
                description
            );

            article.append(
                marker,
                content
            );

            container.appendChild(article);

        });

    }

    function renderModalComments(comments) {

        const container =
            document.getElementById(
                "applicationModalComments"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        comments.forEach((comment) => {

            const article =
                document.createElement("article");

            const heading =
                document.createElement("div");

            heading.className =
                "application-modal-comment-heading";

            const author =
                document.createElement("strong");

            author.textContent =
                comment.author;

            const date =
                document.createElement("span");

            date.textContent =
                comment.date;

            const message =
                document.createElement("p");

            message.textContent =
                comment.message;

            heading.append(
                author,
                date
            );

            article.append(
                heading,
                message
            );

            container.appendChild(article);

        });

    }

    function renderModalAnswers(answers) {

        const container =
            document.getElementById(
                "applicationModalAnswers"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        answers.forEach((item) => {

            const article =
                document.createElement("article");

            const question =
                document.createElement("span");

            question.textContent =
                item.question;

            const answer =
                document.createElement("p");

            answer.textContent =
                item.answer;

            article.append(
                question,
                answer
            );

            container.appendChild(article);

        });

    }


    /* ================================= */
    /* WITHDRAWAL MODAL */
    /* ================================= */

    function openWithdrawModal(card) {

        if (!withdrawModal || !card) {
            return;
        }

        activeApplicationCard = card;

        const reference =
            card.dataset.reference ||
            "Unknown";

        if (withdrawReference) {

            withdrawReference.textContent =
                reference;

        }

        if (withdrawReason) {

            withdrawReason.value = "";

        }

        openModal(withdrawModal);

    }

    function confirmWithdrawal() {

        if (!activeApplicationCard) {
            return;
        }

        const reference =
            activeApplicationCard.dataset.reference ||
            "Application";

        activeApplicationCard.classList.add(
            "is-loading"
        );

        if (confirmWithdrawButton) {

            confirmWithdrawButton.disabled = true;
            confirmWithdrawButton.textContent =
                "Withdrawing...";

        }

        window.setTimeout(() => {

            activeApplicationCard.classList.remove(
                "is-loading"
            );

            activeApplicationCard.classList.add(
                "is-withdrawn"
            );

            activeApplicationCard.dataset.status =
                "withdrawn";

            const badge =
                activeApplicationCard.querySelector(
                    ".application-status-badge"
                );

            if (badge) {

                badge.textContent =
                    "Withdrawn";

                badge.className =
                    "application-status-badge withdrawn";

            }

            closeModal(withdrawModal);

            showToast(
                "Application withdrawn",
                `${reference} has been removed from the active review queue.`
            );

            if (confirmWithdrawButton) {

                confirmWithdrawButton.disabled = false;
                confirmWithdrawButton.textContent =
                    "Withdraw Application";

            }

            activeApplicationCard = null;

            renderApplications();

        }, 700);

    }


    /* ================================= */
    /* MODAL CONTROLS */
    /* ================================= */

    function openModal(modal) {

        if (!modal) {
            return;
        }

        closeAllModals();

        modal.classList.add("is-open");
        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "application-modal-open"
        );

        const focusTarget =
            modal.querySelector(
                ".application-modal-close, button, a, input, textarea, select"
            );

        window.setTimeout(() => {

            focusTarget?.focus();

        }, 50);

    }

    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove("is-open");
        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !document.querySelector(
                ".application-modal.is-open"
            )
        ) {

            document.body.classList.remove(
                "application-modal-open"
            );

        }

    }

    function closeAllModals() {

        document
            .querySelectorAll(
                ".application-modal.is-open"
            )
            .forEach((modal) => {

                closeModal(modal);

            });

    }


    /* ================================= */
    /* TOAST */
    /* ================================= */

    function showToast(title, message) {

        if (
            !toast ||
            !toastTitle ||
            !toastMessage
        ) {
            return;
        }

        window.clearTimeout(
            toastTimeout
        );

        toastTitle.textContent =
            title;

        toastMessage.textContent =
            message;

        toast.classList.add(
            "is-visible"
        );

        toast.setAttribute(
            "aria-hidden",
            "false"
        );

        toastTimeout =
            window.setTimeout(() => {

                hideToast();

            }, 4500);

    }

    function hideToast() {

        if (!toast) {
            return;
        }

        toast.classList.remove(
            "is-visible"
        );

        toast.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* ================================= */
    /* SMALL UTILITY */
    /* ================================= */

    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                value;

        }

    }


    /* ================================= */
    /* EVENT LISTENERS */
    /* ================================= */

    searchInput?.addEventListener(
        "input",
        () => {

            currentPage = 1;
            renderApplications();

        }
    );

    statusFilter?.addEventListener(
        "change",
        () => {

            currentPage = 1;
            renderApplications();

        }
    );

    typeFilter?.addEventListener(
        "change",
        () => {

            currentPage = 1;
            renderApplications();

        }
    );

    clearFiltersButton?.addEventListener(
        "click",
        resetFilters
    );

    emptyStateResetButton?.addEventListener(
        "click",
        resetFilters
    );

    previousPageButton?.addEventListener(
        "click",
        () => {

            if (currentPage <= 1) {
                return;
            }

            currentPage -= 1;
            renderApplications();

            document
                .querySelector(
                    ".applications-dashboard-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

    nextPageButton?.addEventListener(
        "click",
        () => {

            const totalPages =
                getTotalPages(
                    getVisibleFilteredCards()
                );

            if (currentPage >= totalPages) {
                return;
            }

            currentPage += 1;
            renderApplications();

            document
                .querySelector(
                    ".applications-dashboard-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

    paginationButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const requestedPage =
                        Number(
                            button.dataset.page
                        );

                    if (
                        !Number.isInteger(
                            requestedPage
                        ) ||
                        requestedPage < 1
                    ) {
                        return;
                    }

                    currentPage =
                        requestedPage;

                    renderApplications();

                }
            );

        }
    );

    document.addEventListener(
        "click",
        (event) => {

            const detailsButton =
                event.target.closest(
                    "[data-view-application]"
                );

            if (detailsButton) {

                const card =
                    detailsButton.closest(
                        ".application-card"
                    );

                openDetailsModal(card);
                return;

            }

            const withdrawButton =
                event.target.closest(
                    "[data-withdraw-application]"
                );

            if (withdrawButton) {

                const card =
                    withdrawButton.closest(
                        ".application-card"
                    );

                openWithdrawModal(card);
                return;

            }

            if (
                event.target.closest(
                    "[data-close-application-modal]"
                )
            ) {

                closeModal(detailsModal);
                return;

            }

            if (
                event.target.closest(
                    "[data-close-withdraw-modal]"
                )
            ) {

                closeModal(withdrawModal);

            }

        }
    );

    confirmWithdrawButton?.addEventListener(
        "click",
        confirmWithdrawal
    );

    toastCloseButton?.addEventListener(
        "click",
        hideToast
    );

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeAllModals();
                hideToast();

            }

        }
    );


    /* ================================= */
    /* INITIAL RENDER */
    /* ================================= */

    renderApplications();

});