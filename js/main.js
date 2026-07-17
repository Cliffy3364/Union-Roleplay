document.addEventListener("DOMContentLoaded", () => {
    initialiseMobileNavigation();
    initialiseRulesSearch();
    initialiseRulesNavigation();
    initialiseRuleAccordions();
});

/* ================================= */
/* MOBILE NAVIGATION */
/* ================================= */

function initialiseMobileNavigation() {
    const menuButton = document.querySelector(".mobile-menu-button");
    const navigation = document.querySelector(".nav-links");
    const navButtons = document.querySelector(".nav-buttons");

    if (!menuButton || !navigation) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute("aria-expanded", String(!isOpen));
        menuButton.classList.toggle("active", !isOpen);
        navigation.classList.toggle("active", !isOpen);

        if (navButtons) {
            navButtons.classList.toggle("active", !isOpen);
        }

        document.body.classList.toggle("menu-open", !isOpen);
    });

    const navigationLinks = document.querySelectorAll(
        ".nav-links a, .nav-buttons a"
    );

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMobileNavigation(menuButton, navigation, navButtons);
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) {
            closeMobileNavigation(menuButton, navigation, navButtons);
        }
    });
}

function closeMobileNavigation(menuButton, navigation, navButtons) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.classList.remove("active");
    navigation.classList.remove("active");

    if (navButtons) {
        navButtons.classList.remove("active");
    }

    document.body.classList.remove("menu-open");
}

/* ================================= */
/* RULE SEARCH */
/* ================================= */

function initialiseRulesSearch() {
    const searchInput = document.querySelector("#rules-search");
    const ruleCategories = document.querySelectorAll("[data-rule-category]");
    const noResultsMessage = document.querySelector("#rules-no-results");

    if (!searchInput || ruleCategories.length === 0) {
        return;
    }

    searchInput.addEventListener("input", () => {
        const searchTerm = normaliseText(searchInput.value);
        let visibleRuleCount = 0;

        ruleCategories.forEach((category) => {
            const ruleItems = category.querySelectorAll("[data-rule-item]");
            let visibleCategoryRules = 0;

            ruleItems.forEach((ruleItem) => {
                const ruleText = normaliseText(ruleItem.textContent);
                const matchesSearch =
                    searchTerm === "" || ruleText.includes(searchTerm);

                ruleItem.classList.toggle("rule-hidden", !matchesSearch);
                ruleItem.classList.toggle(
                    "rule-search-highlight",
                    matchesSearch && searchTerm !== ""
                );

                if (matchesSearch) {
                    visibleRuleCount += 1;
                    visibleCategoryRules += 1;

                    if (searchTerm !== "") {
                        ruleItem.open = true;
                    }
                }
            });

            category.classList.toggle(
                "rule-hidden",
                visibleCategoryRules === 0
            );
        });

        if (noResultsMessage) {
            noResultsMessage.hidden =
                searchTerm === "" || visibleRuleCount > 0;
        }
    });
}

function normaliseText(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

/* ================================= */
/* RULE SIDEBAR NAVIGATION */
/* ================================= */

function initialiseRulesNavigation() {
    const navigationLinks = document.querySelectorAll(
        ".rules-navigation a"
    );

    const ruleCategories = document.querySelectorAll(
        "[data-rule-category]"
    );

    if (
        navigationLinks.length === 0 ||
        ruleCategories.length === 0
    ) {
        return;
    }

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.forEach((navLink) => {
                navLink.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            const visibleEntries = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                    (firstEntry, secondEntry) =>
                        secondEntry.intersectionRatio -
                        firstEntry.intersectionRatio
                );

            if (visibleEntries.length === 0) {
                return;
            }

            const activeSectionId =
                visibleEntries[0].target.getAttribute("id");

            navigationLinks.forEach((link) => {
                const linkTarget = link
                    .getAttribute("href")
                    ?.replace("#", "");

                link.classList.toggle(
                    "active",
                    linkTarget === activeSectionId
                );
            });
        },
        {
            root: null,
            rootMargin: "-20% 0px -65% 0px",
            threshold: [0.05, 0.2, 0.4]
        }
    );

    ruleCategories.forEach((category) => {
        observer.observe(category);
    });
}

/* ================================= */
/* RULE ACCORDIONS */
/* ================================= */

function initialiseRuleAccordions() {
    const ruleItems = document.querySelectorAll("[data-rule-item]");

    if (ruleItems.length === 0) {
        return;
    }

    ruleItems.forEach((ruleItem) => {
        ruleItem.addEventListener("toggle", () => {
            const toggleIcon =
                ruleItem.querySelector(".rule-toggle");

            if (!toggleIcon) {
                return;
            }

            toggleIcon.setAttribute(
                "aria-label",
                ruleItem.open ? "Close rule" : "Open rule"
            );
        });
    });
}
/* ================================= */
/* WHITELIST APPLICATION */
/* ================================= */

document.addEventListener("DOMContentLoaded", initialiseWhitelistForm);

function initialiseWhitelistForm() {

    const form = document.querySelector("#whitelist-form");

    if (!form) {
        return;
    }

    const progressBar =
        document.querySelector("#application-progress-bar");

    const progressPercentage =
        document.querySelector("#application-progress-percentage");

    const message =
        document.querySelector("#whitelist-form-message");

    const submitButton =
        form.querySelector("button[type='submit']");

    const fields = form.querySelectorAll(
        "input, textarea, select"
    );

    fields.forEach(field => {

        field.addEventListener("input", updateProgress);
        field.addEventListener("change", updateProgress);

    });

    updateProgress();

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        message.hidden = true;
        message.className = "form-message";

        if (!form.checkValidity()) {

            form.reportValidity();

            message.hidden = false;
            message.classList.add("error");

            message.innerHTML =
                "<strong>Please complete every required field before submitting your application.</strong>";

            return;

        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        /*
        ===========================================
        BACKEND GOES HERE LATER
        ===========================================

        fetch("/api/whitelist", {
            method: "POST",
            body: new FormData(form)
        });

        */

        setTimeout(() => {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Application";

            message.hidden = false;
            message.classList.add("success");

            message.innerHTML =
                "<strong>Your application has been submitted successfully.</strong><br>Our staff team will review it and contact you through Discord.";

            form.reset();

            updateProgress();

            window.scrollTo({

                top: form.offsetTop - 120,
                behavior: "smooth"

            });

        }, 1400);

    });

    function updateProgress() {

        let total = 0;
        let complete = 0;

        fields.forEach(field => {

            if (
                field.type === "submit" ||
                field.type === "button"
            ) {
                return;
            }

            total++;

            if (field.type === "checkbox") {

                if (field.checked) {
                    complete++;
                }

                return;

            }

            if (field.value.trim() !== "") {
                complete++;
            }

        });

        const percentage = Math.round(
            (complete / total) * 100
        );

        progressBar.style.width = percentage + "%";
        progressPercentage.textContent =
            percentage + "%";

    }

}
/* ================================= */
/* RECRUITMENT PAGE */
/* ================================= */

document.addEventListener("DOMContentLoaded", () => {
    initialisePositionFilters();
    initialisePositionDetailsButtons();
    initialiseRecruitmentForm();
});

/* ================================= */
/* POSITION FILTERING */
/* ================================= */

function initialisePositionFilters() {
    const filterButtons = document.querySelectorAll(
        "[data-position-filter]"
    );

    const positionCards = document.querySelectorAll(
        "[data-position-category]"
    );

    if (
        filterButtons.length === 0 ||
        positionCards.length === 0
    ) {
        return;
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedFilter =
                button.dataset.positionFilter;

            filterButtons.forEach((filterButton) => {
                filterButton.classList.remove("active");
            });

            button.classList.add("active");

            positionCards.forEach((card) => {
                const cardCategory =
                    card.dataset.positionCategory;

                const shouldShow =
                    selectedFilter === "all" ||
                    cardCategory === selectedFilter;

                card.classList.toggle(
                    "position-hidden",
                    !shouldShow
                );
            });
        });
    });
}

/* ================================= */
/* POSITION DETAILS BUTTONS */
/* ================================= */

function initialisePositionDetailsButtons() {
    const detailsButtons = document.querySelectorAll(
        "[data-position-target]"
    );

    if (detailsButtons.length === 0) {
        return;
    }

    detailsButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetId =
                button.dataset.positionTarget;

            const targetDetails =
                document.getElementById(targetId);

            if (!targetDetails) {
                return;
            }

            targetDetails.open = true;

            targetDetails.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    });
}

/* ================================= */
/* RECRUITMENT APPLICATION */
/* ================================= */

function initialiseRecruitmentForm() {
    const form =
        document.querySelector("#recruitment-form");

    if (!form) {
        return;
    }

    const progressBar =
        document.querySelector(
            "#recruitment-progress-bar"
        );

    const progressPercentage =
        document.querySelector(
            "#recruitment-progress-percentage"
        );

    const formMessage =
        document.querySelector(
            "#recruitment-form-message"
        );

    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );

    const fields =
        form.querySelectorAll(
            "input, textarea, select"
        );

    fields.forEach((field) => {
        field.addEventListener(
            "input",
            updateRecruitmentProgress
        );

        field.addEventListener(
            "change",
            updateRecruitmentProgress
        );
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearRecruitmentMessage();

        if (!form.checkValidity()) {
            form.reportValidity();

            showRecruitmentMessage(
                "error",
                "Please complete every required field before submitting your application."
            );

            return;
        }

        const primaryPosition =
            form.elements.position.value;

        const secondaryPosition =
            form.elements.secondaryPosition.value;

        if (
            primaryPosition !== "" &&
            primaryPosition === secondaryPosition
        ) {
            showRecruitmentMessage(
                "error",
                "Your secondary position must be different from your primary position."
            );

            form.elements.secondaryPosition.focus();

            return;
        }

        setRecruitmentSubmittingState(true);

        const applicationData =
            Object.fromEntries(
                new FormData(form).entries()
            );

        /*
        ===========================================
        BACKEND INTEGRATION GOES HERE LATER
        ===========================================

        Example:

        const response = await fetch(
            "/api/recruitment",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(applicationData)
            }
        );

        if (!response.ok) {
            throw new Error(
                "Application submission failed."
            );
        }

        */

        try {
            await simulateRecruitmentSubmission(
                applicationData
            );

            showRecruitmentMessage(
                "success",
                "Your recruitment application has been submitted successfully. Union Roleplay management will contact you through Discord if you progress to the next stage."
            );

            form.reset();
            updateRecruitmentProgress();

            formMessage.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } catch (error) {
            console.error(
                "Recruitment submission error:",
                error
            );

            showRecruitmentMessage(
                "error",
                "Your application could not be submitted. Please try again or contact management through Discord."
            );
        } finally {
            setRecruitmentSubmittingState(false);
        }
    });

    updateRecruitmentProgress();

    function updateRecruitmentProgress() {
        let totalFields = 0;
        let completedFields = 0;

        fields.forEach((field) => {
            if (
                field.disabled ||
                field.type === "submit" ||
                field.type === "button"
            ) {
                return;
            }

            if (!field.required) {
                return;
            }

            totalFields += 1;

            if (field.type === "checkbox") {
                if (field.checked) {
                    completedFields += 1;
                }

                return;
            }

            if (field.value.trim() !== "") {
                completedFields += 1;
            }
        });

        const progress =
            totalFields === 0
                ? 0
                : Math.round(
                    (
                        completedFields /
                        totalFields
                    ) * 100
                );

        if (progressBar) {
            progressBar.style.width =
                `${progress}%`;
        }

        if (progressPercentage) {
            progressPercentage.textContent =
                `${progress}%`;
        }
    }

    function clearRecruitmentMessage() {
        if (!formMessage) {
            return;
        }

        formMessage.hidden = true;
        formMessage.className = "form-message";
        formMessage.textContent = "";
    }

    function showRecruitmentMessage(
        type,
        message
    ) {
        if (!formMessage) {
            return;
        }

        formMessage.hidden = false;
        formMessage.className =
            `form-message ${type}`;

        formMessage.innerHTML =
            `<strong>${escapeRecruitmentHtml(
                message
            )}</strong>`;
    }

    function setRecruitmentSubmittingState(
        isSubmitting
    ) {
        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;

        submitButton.textContent =
            isSubmitting
                ? "Submitting..."
                : "Submit Application";
    }
}

/* ================================= */
/* TEMPORARY SUBMISSION SIMULATION */
/* ================================= */

function simulateRecruitmentSubmission(
    applicationData
) {
    return new Promise((resolve) => {
        console.log(
            "Recruitment application:",
            applicationData
        );

        window.setTimeout(resolve, 1400);
    });
}

/* ================================= */
/* BASIC OUTPUT PROTECTION */
/* ================================= */

function escapeRecruitmentHtml(value) {
    const element =
        document.createElement("div");

    element.textContent = String(value);

    return element.innerHTML;
}
/* ================================= */
/* SUPPORT PAGE */
/* COPY SERVER + TROUBLESHOOTING */
/* ================================= */

document.addEventListener("DOMContentLoaded", () => {
    initialiseSupportPage();
});

function initialiseSupportPage() {
    initialiseServerCopyButton();
    initialiseSupportSearch();
    initialiseSupportAccordions();
}


/* ================================= */
/* COPY SERVER ADDRESS */
/* ================================= */

function initialiseServerCopyButton() {
    const copyButton = document.querySelector(".copy-server-button");

    if (!copyButton) {
        return;
    }

    const serverAddress =
        copyButton.dataset.serverAddress ||
        "185.223.29.112:30120";

    const originalText = copyButton.textContent.trim();

    copyButton.addEventListener("click", async () => {
        try {
            await copyTextToClipboard(serverAddress);

            copyButton.textContent = "Copied";
            copyButton.classList.add("copied");
            copyButton.setAttribute(
                "aria-label",
                `Copied ${serverAddress} to clipboard`
            );

            window.setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.classList.remove("copied");
                copyButton.setAttribute(
                    "aria-label",
                    `Copy server address ${serverAddress}`
                );
            }, 2200);
        } catch (error) {
            console.error("Unable to copy server address:", error);

            copyButton.textContent = "Copy failed";
            copyButton.classList.remove("copied");

            window.setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2200);
        }
    });
}

async function copyTextToClipboard(text) {
    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const temporaryInput = document.createElement("textarea");

    temporaryInput.value = text;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.top = "-9999px";
    temporaryInput.style.left = "-9999px";
    temporaryInput.style.opacity = "0";

    document.body.appendChild(temporaryInput);

    temporaryInput.focus();
    temporaryInput.select();

    const copied = document.execCommand("copy");

    temporaryInput.remove();

    if (!copied) {
        throw new Error("Clipboard copy command failed.");
    }
}


/* ================================= */
/* TROUBLESHOOTING SEARCH */
/* ================================= */

function initialiseSupportSearch() {
    const searchInput = document.querySelector(
        "#supportTroubleshootingSearch"
    );

    const faqItems = Array.from(
        document.querySelectorAll(".support-faq-item")
    );

    const emptyMessage = document.querySelector(
        ".support-search-empty"
    );

    if (!searchInput || faqItems.length === 0) {
        return;
    }

    const searchableItems = faqItems.map((item) => {
        const summary = item.querySelector("summary");
        const answer = item.querySelector("div");

        return {
            item,
            summary,
            answer,
            searchableText: normaliseSearchText(
                `${summary?.textContent || ""} ${answer?.textContent || ""}`
            )
        };
    });

    searchInput.addEventListener("input", () => {
        const searchTerm = normaliseSearchText(searchInput.value);
        let visibleResults = 0;

        searchableItems.forEach((entry) => {
            const isMatch =
                searchTerm.length === 0 ||
                entry.searchableText.includes(searchTerm);

            entry.item.classList.toggle(
                "support-search-hidden",
                !isMatch
            );

            if (isMatch) {
                visibleResults += 1;
            }

            if (!isMatch && entry.item.open) {
                entry.item.open = false;
            }

            if (searchTerm.length === 0) {
                removeSupportHighlights(entry.summary);
                removeSupportHighlights(entry.answer);
            }
        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleResults !== 0;
        }
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        searchInput.blur();
    });
}

function normaliseSearchText(value) {
    return String(value)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function removeSupportHighlights(element) {
    if (!element) {
        return;
    }

    const highlights = element.querySelectorAll(
        ".support-search-highlight"
    );

    highlights.forEach((highlight) => {
        const parent = highlight.parentNode;

        highlight.replaceWith(
            document.createTextNode(highlight.textContent)
        );

        parent?.normalize();
    });
}


/* ================================= */
/* FAQ ACCORDION BEHAVIOUR */
/* ================================= */

function initialiseSupportAccordions() {
    const faqItems = Array.from(
        document.querySelectorAll(".support-faq-item")
    );

    if (faqItems.length === 0) {
        return;
    }

    faqItems.forEach((item) => {
        item.addEventListener("toggle", () => {
            if (!item.open) {
                return;
            }

            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.open = false;
                }
            });
        });
    });
}