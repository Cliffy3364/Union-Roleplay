/* ==========================================================
   THE DISTRICT - CREATOR ROSTER

   Add approved creators to the array below.
   Set live to true when they are live, or wire this data to
   your own API later without changing the page design.

   Example creator:

   {
       name: "Creator Name",
       handle: "@creator",
       platform: "Twitch",
       channelUrl: "https://twitch.tv/creator",
       avatar: "../assets/images/logo.png",
       thumbnail: "https://example.com/live-thumbnail.jpg",
       live: true,
       viewers: 25,
       statusLine: "Police RP | The District",
       tags: ["POLICE RP", "UK ROLEPLAY"]
   }
========================================================== */

const DISTRICT_CREATORS = [];

const CREATORS_API =
    "https://the-district-api.danielclifford2808.workers.dev";


function creatorEscapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function creatorSafeUrl(value) {

    const url = String(value || "").trim();

    if (!url) {
        return "";
    }

    try {

        const parsed = new URL(
            url,
            window.location.href
        );

        if (
            parsed.protocol !== "https:" &&
            parsed.protocol !== "http:"
        ) {
            return "";
        }

        return parsed.href;

    } catch {

        return "";
    }
}


function creatorInitials(name) {

    const parts = String(name || "Creator")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    return (
        parts
            .map(part => part.charAt(0))
            .join("") || "CR"
    ).toUpperCase();
}


function creatorAvatarMarkup(creator) {

    const avatar = creatorSafeUrl(
        creator.avatar
    );

    if (avatar) {

        return `
            <span class="creator-avatar">
                <img
                    src="${creatorEscapeHtml(avatar)}"
                    alt="${creatorEscapeHtml(creator.name || "Creator")}"
                    loading="lazy"
                >
            </span>
        `;
    }

    return `
        <span class="creator-avatar">
            ${creatorEscapeHtml(
                creatorInitials(creator.name)
            )}
        </span>
    `;
}


function creatorThumbnailMarkup(creator) {

    const thumbnail = creatorSafeUrl(
        creator.thumbnail
    );

    if (!thumbnail) {
        return "";
    }

    return `
        <img
            src="${creatorEscapeHtml(thumbnail)}"
            alt="${creatorEscapeHtml(creator.name || "Creator")} live stream preview"
            loading="lazy"
        >
    `;
}


function creatorViewerLabel(viewers) {

    const count = Number(viewers);

    if (!Number.isFinite(count) || count < 0) {
        return "Live now";
    }

    return `${count.toLocaleString()} watching`;
}


function creatorTagsMarkup(tags) {

    if (!Array.isArray(tags) || tags.length === 0) {
        return "";
    }

    return `
        <div class="creator-live-tags">
            ${tags
                .slice(0, 4)
                .map(tag => `
                    <span>${creatorEscapeHtml(tag)}</span>
                `)
                .join("")}
        </div>
    `;
}


function creatorLinkAttributes(creator) {

    const url = creatorSafeUrl(
        creator.channelUrl
    );

    if (!url) {
        return {
            href: "#",
            extra: 'aria-disabled="true" onclick="return false;"'
        };
    }

    return {
        href: creatorEscapeHtml(url),
        extra: 'target="_blank" rel="noopener noreferrer"'
    };
}


function renderLiveCreatorCard(creator) {

    const link = creatorLinkAttributes(
        creator
    );

    return `
        <article class="creator-live-card">

            <a
                class="creator-live-preview"
                href="${link.href}"
                ${link.extra}
            >
                ${creatorThumbnailMarkup(creator)}

                <span class="creator-live-pill">
                    ● LIVE
                </span>

                <span class="creator-live-viewers">
                    ${creatorEscapeHtml(
                        creatorViewerLabel(creator.viewers)
                    )}
                </span>
            </a>

            <div class="creator-live-body">

                <div class="creator-live-identity">

                    ${creatorAvatarMarkup(creator)}

                    <div class="creator-live-name">
                        <strong>
                            ${creatorEscapeHtml(
                                creator.name || "Creator"
                            )}
                        </strong>
                        <span>
                            ${creatorEscapeHtml(
                                creator.statusLine ||
                                creator.handle ||
                                "Live in The District"
                            )}
                        </span>
                    </div>

                    <span class="creator-platform-badge">
                        ${creatorEscapeHtml(
                            creator.platform || "Live"
                        )}
                    </span>

                </div>

                ${creatorTagsMarkup(creator.tags)}

            </div>

            <a
                class="creator-live-link"
                href="${link.href}"
                ${link.extra}
            >
                <span>Watch Stream</span>
                <span>→</span>
            </a>

        </article>
    `;
}


function renderRosterCreatorCard(creator) {

    const link = creatorLinkAttributes(
        creator
    );

    const isLive =
        creator.live === true;

    return `
        <article class="creator-roster-card">

            <div class="creator-roster-top">

                ${creatorAvatarMarkup(creator)}

                <div class="creator-roster-info">
                    <strong>
                        ${creatorEscapeHtml(
                            creator.name || "Creator"
                        )}
                    </strong>
                    <span>
                        ${creatorEscapeHtml(
                            creator.platform || "Creator"
                        )}
                    </span>
                </div>

                <span class="creator-roster-status ${isLive ? "live" : ""}">
                    <i></i>
                    ${isLive ? "LIVE" : "OFFLINE"}
                </span>

            </div>

            <div class="creator-roster-bottom">

                <span class="creator-roster-handle">
                    ${creatorEscapeHtml(
                        creator.handle ||
                        creator.statusLine ||
                        "The District Creator"
                    )}
                </span>

                <a
                    class="creator-roster-link"
                    href="${link.href}"
                    ${link.extra}
                >
                    View Channel →
                </a>

            </div>

        </article>
    `;
}


function renderLiveEmptyState() {

    return `
        <div class="creator-empty-state">
            <div>
                <div class="creator-empty-icon">LIVE</div>
                <h3>Nobody is live right now</h3>
                <p>
                    When an official District creator goes live, their stream
                    will appear here at the top of the page.
                </p>
            </div>
        </div>
    `;
}


function renderRosterEmptyState() {

    return `
        <div class="creator-empty-state">
            <div>
                <div class="creator-empty-icon">SR</div>
                <h3>The creator roster is being built</h3>
                <p>
                    Approved streamers will appear here. If you create FiveM
                    content, applications for the creator network are open.
                </p>
                <a href="apply.html?type=Streamer%20Application">
                    Apply as a Streamer →
                </a>
            </div>
        </div>
    `;
}


function renderCreatorsPage() {

    const creators = Array.isArray(
        DISTRICT_CREATORS
    )
        ? DISTRICT_CREATORS
        : [];

    const liveCreators =
        creators.filter(
            creator =>
                creator &&
                creator.live === true
        );

    const liveTarget =
        document.getElementById(
            "liveCreators"
        );

    const rosterTarget =
        document.getElementById(
            "creatorRosterGrid"
        );

    const liveCount =
        document.getElementById(
            "liveCreatorCount"
        );

    const totalCount =
        document.getElementById(
            "totalCreatorCount"
        );


    if (liveCount) {
        liveCount.textContent =
            String(liveCreators.length);
    }

    if (totalCount) {
        totalCount.textContent =
            String(creators.length);
    }


    if (liveTarget) {

        liveTarget.innerHTML =
            liveCreators.length > 0
                ? liveCreators
                    .map(renderLiveCreatorCard)
                    .join("")
                : renderLiveEmptyState();
    }


    if (rosterTarget) {

        rosterTarget.innerHTML =
            creators.length > 0
                ? creators
                    .map(renderRosterCreatorCard)
                    .join("")
                : renderRosterEmptyState();
    }
}


function normalizeCreatorApplicationStatus(value) {

    const status = String(value || "open")
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


function setStreamerApplicationStatus(status) {

    const normalized =
        normalizeCreatorApplicationStatus(status);

    const isOpen =
        normalized === "open";

    const statusText =
        normalized === "temporarily_closed"
            ? "PAUSED"
            : normalized === "closed"
                ? "CLOSED"
                : "OPEN";

    const statusElement =
        document.getElementById(
            "creatorApplicationStatus"
        );

    if (statusElement) {
        statusElement.textContent =
            statusText;
    }

    document
        .querySelectorAll(
            "[data-streamer-application-link]"
        )
        .forEach(link => {

            if (!link.dataset.originalHref) {
                link.dataset.originalHref =
                    link.getAttribute("href") || "";
            }

            link.classList.toggle(
                "creators-application-disabled",
                !isOpen
            );

            link.setAttribute(
                "aria-disabled",
                isOpen ? "false" : "true"
            );

            if (isOpen) {
                link.href =
                    link.dataset.originalHref;
            } else {
                link.removeAttribute("href");
            }
        });
}


async function loadStreamerApplicationStatus() {

    try {

        const response = await fetch(
            `${CREATORS_API}/api/applications/availability`,
            { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                "Application availability could not be loaded."
            );
        }

        const row = Array.isArray(data.applications)
            ? data.applications.find(
                item =>
                    item.application_type ===
                    "Streamer Application"
            )
            : null;

        setStreamerApplicationStatus(
            row?.status || "open"
        );

    } catch (error) {

        console.warn(
            "Streamer application status could not be loaded:",
            error
        );

        setStreamerApplicationStatus("open");
    }
}


document.addEventListener(
    "click",
    event => {

        const disabledLink =
            event.target.closest(
                ".creators-application-disabled"
            );

        if (!disabledLink) {
            return;
        }

        event.preventDefault();
    }
);


document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderCreatorsPage();
        loadStreamerApplicationStatus();
    }
);
