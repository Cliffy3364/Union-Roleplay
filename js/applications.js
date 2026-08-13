const APPLICATIONS_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";


function normalizeAvailabilityStatus(value) {

    const status =
        String(value || "")
            .trim()
            .toLowerCase();

    if (
        status === "open" ||
        status === "temporarily_closed" ||
        status === "closed"
    ) {
        return status;
    }

    return "open";
}


function availabilityLabel(status) {

    switch (
        normalizeAvailabilityStatus(status)
    ) {

        case "temporarily_closed":
            return "TEMPORARILY CLOSED";

        case "closed":
            return "CLOSED";

        case "open":
        default:
            return "OPEN";
    }
}


function availabilityDetailLabel(status) {

    switch (
        normalizeAvailabilityStatus(status)
    ) {

        case "temporarily_closed":
            return "Temporarily Closed";

        case "closed":
            return "Closed";

        case "open":
        default:
            return "Open";
    }
}


function availabilityClass(status) {

    return normalizeAvailabilityStatus(status)
        .replaceAll("_", "-");
}


function setCardAvailability(
    card,
    status
) {

    if (!card) {
        return;
    }

    const normalized =
        normalizeAvailabilityStatus(
            status
        );

    const isOpen =
        normalized === "open";

    const statusElement =
        card.querySelector(
            "[data-application-status]"
        );

    const detailStatus =
        card.querySelector(
            "[data-application-detail-status]"
        );

    const link =
        card.querySelector(
            "[data-application-link]"
        );

    const linkText =
        card.querySelector(
            "[data-application-link-text]"
        );

    const actionKicker =
        card.querySelector(
            "[data-application-action-kicker]"
        );

    const actionTitle =
        card.querySelector(
            "[data-application-action-title]"
        );


    card.dataset.applicationAvailability =
        normalized;


    card.classList.remove(
        "availability-open",
        "availability-temporarily-closed",
        "availability-closed"
    );

    card.classList.add(
        `availability-${availabilityClass(normalized)}`
    );


    if (statusElement) {

        const dot =
            statusElement.querySelector(
                "span"
            );

        statusElement.innerHTML = "";

        if (dot) {
            statusElement.appendChild(dot);
        } else {
            statusElement.appendChild(
                document.createElement(
                    "span"
                )
            );
        }

        statusElement.append(
            document.createTextNode(
                card.classList.contains(
                    "application-featured-card"
                )
                    ? ` APPLICATIONS ${availabilityLabel(normalized)}`
                    : ` ${availabilityLabel(normalized)}`
            )
        );
    }


    if (detailStatus) {

        detailStatus.textContent =
            availabilityDetailLabel(
                normalized
            );
    }


    if (link) {

        if (
            !link.dataset.originalHref
        ) {
            link.dataset.originalHref =
                link.getAttribute("href") ||
                "";
        }

        link.classList.toggle(
            "application-link-disabled",
            !isOpen
        );

        link.setAttribute(
            "aria-disabled",
            isOpen
                ? "false"
                : "true"
        );

        if (isOpen) {

            link.href =
                link.dataset.originalHref;

            link.removeAttribute(
                "tabindex"
            );

        } else {

            link.removeAttribute(
                "href"
            );

            link.setAttribute(
                "tabindex",
                "-1"
            );
        }
    }


    if (
        linkText &&
        !card.classList.contains(
            "application-featured-card"
        )
    ) {

        if (
            !linkText.dataset.originalText
        ) {
            linkText.dataset.originalText =
                linkText.textContent.trim();
        }

        linkText.textContent =
            isOpen
                ? linkText.dataset.originalText
                : availabilityDetailLabel(
                    normalized
                );
    }


    if (
        linkText &&
        card.classList.contains(
            "application-featured-card"
        )
    ) {

        linkText.textContent =
            isOpen
                ? "Apply Now"
                : availabilityDetailLabel(
                    normalized
                );
    }


    if (actionKicker) {

        actionKicker.textContent =
            isOpen
                ? "READY TO BEGIN?"
                : normalized ===
                    "temporarily_closed"
                    ? "RECRUITMENT PAUSED"
                    : "RECRUITMENT CLOSED";
    }


    if (actionTitle) {

        actionTitle.textContent =
            isOpen
                ? "Start your application"
                : normalized ===
                    "temporarily_closed"
                    ? "Applications are temporarily unavailable"
                    : "Applications are currently closed";
    }
}


function setOverallRecruitmentStatus(
    rows
) {

    const statuses =
        rows.map(
            row =>
                normalizeAvailabilityStatus(
                    row.status
                )
        );

    const openCount =
        statuses.filter(
            status =>
                status === "open"
        ).length;

    const availableCount =
        document.getElementById(
            "applicationsAvailableCount"
        );

    const overallStatus =
        document.getElementById(
            "recruitmentOverallStatus"
        );


    if (availableCount) {

        availableCount.textContent =
            String(openCount);
    }


    if (!overallStatus) {
        return;
    }


    overallStatus.classList.remove(
        "overall-open",
        "overall-partial",
        "overall-closed"
    );


    if (
        openCount ===
        statuses.length
    ) {

        overallStatus.textContent =
            "OPEN";

        overallStatus.classList.add(
            "overall-open"
        );

        return;
    }


    if (openCount > 0) {

        overallStatus.textContent =
            "PARTIALLY OPEN";

        overallStatus.classList.add(
            "overall-partial"
        );

        return;
    }


    overallStatus.textContent =
        "CLOSED";

    overallStatus.classList.add(
        "overall-closed"
    );
}


async function loadApplicationAvailability() {

    try {

        const response =
            await fetch(
                `${APPLICATIONS_API}/api/applications/availability`,
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Application availability could not be loaded."
            );
        }


        const rows =
            Array.isArray(
                data.applications
            )
                ? data.applications
                : [];


        const map =
            new Map(
                rows.map(
                    row => [
                        row.application_type,
                        row
                    ]
                )
            );


        document
            .querySelectorAll(
                "[data-application-card]"
            )
            .forEach(
                card => {

                    const type =
                        card.dataset
                            .applicationType;

                    const row =
                        map.get(type);

                    setCardAvailability(
                        card,
                        row?.status ||
                        "open"
                    );
                }
            );


        setOverallRecruitmentStatus(
            rows
        );


    } catch (error) {

        console.error(
            "Application availability error:",
            error
        );

        /*
            Fail open visually if the API cannot be reached.
            The Worker still blocks closed applications server-side.
        */
    }
}


document.addEventListener(
    "click",
    event => {

        const disabledLink =
            event.target.closest(
                ".application-link-disabled"
            );

        if (!disabledLink) {
            return;
        }

        event.preventDefault();
    }
);


document.addEventListener(
    "DOMContentLoaded",
    loadApplicationAvailability
);
