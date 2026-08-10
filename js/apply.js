const APPLY_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";

const DISCORD_LOGIN_URL =
    `${APPLY_API}/api/auth/discord`;

const APPLICATION_CONFIG = {
    "Whitelist Application": {
        title: "Whitelist Application",
        description:
            "Apply for access to Union Roleplay.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "timezone",
                label: "What is your timezone?",
                type: "text",
                required: true
            },
            {
                key: "roleplayExperience",
                label: "Tell us about your previous roleplay experience.",
                type: "textarea",
                required: true
            },
            {
                key: "whyUnion",
                label: "Why do you want to join Union Roleplay?",
                type: "textarea",
                required: true
            },
            {
                key: "scenario",
                label: "You are stopped by police after a pursuit. Explain how you would roleplay the situation.",
                type: "textarea",
                required: true
            }
        ]
    },

    "Staff Application": {
        title: "Staff Application",
        description:
            "Apply to join the Union Roleplay staff team.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Do you have any previous staff experience? Tell us about it.",
                type: "textarea",
                required: true
            },
            {
                key: "whyStaff",
                label: "Why do you want to join the Union Roleplay staff team?",
                type: "textarea",
                required: true
            },
            {
                key: "strengths",
                label: "What strengths would you bring to the staff team?",
                type: "textarea",
                required: true
            },
            {
                key: "staffScenario",
                label: "Two players are arguing in a staff situation and both are blaming each other. How would you handle it?",
                type: "textarea",
                required: true
            }
        ]
    },

    "QA Tester Application": {
        title: "QA Tester Application",
        description:
            "Apply to test scripts, systems and updates before release.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "availability",
                label: "When are you usually available to test?",
                type: "textarea",
                required: true
            },
            {
                key: "testingExperience",
                label: "Do you have any previous QA or testing experience?",
                type: "textarea",
                required: true
            },
            {
                key: "bugReporting",
                label: "How would you report a bug clearly to a developer?",
                type: "textarea",
                required: true
            },
            {
                key: "whyQa",
                label: "Why do you want to become a QA Tester for Union Roleplay?",
                type: "textarea",
                required: true
            }
        ]
    },

    "Social Media Manager Application": {
        title: "Social Media Manager Application",
        description:
            "Apply to manage Union Roleplay's social media presence and coordinate the media team.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Describe your previous social media or FiveM media experience.",
                type: "textarea",
                required: true
            },
            {
                key: "portfolio",
                label: "Provide links or details for at least three examples of your previous FiveM videos or images.",
                type: "textarea",
                required: true
            },
            {
                key: "strategy",
                label: "How would you grow Union Roleplay's social media accounts?",
                type: "textarea",
                required: true
            },
            {
                key: "management",
                label: "How would you organise and request content from the Union Roleplay media team?",
                type: "textarea",
                required: true
            }
        ]
    },
        "Media Application": {
        title: "Media Team Application",
        description:
            "Apply to create screenshots, videos and promotional media for Union Roleplay.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Tell us about your previous FiveM or media experience.",
                type: "textarea",
                required: true
            },
            {
                key: "portfolio",
                label: "Provide examples of your previous media work.",
                type: "textarea",
                required: true
            },
            {
                key: "tools",
                label: "What editing or capture software do you use?",
                type: "textarea",
                required: true
            },
            {
                key: "availability",
                label: "How often would you be available to create media for Union Roleplay?",
                type: "textarea",
                required: true
            }
        ]
    },

    "Script Developer Application": {
        title: "Script Developer Application",
        description:
            "Apply to work on scripts and server systems for Union Roleplay.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Tell us about your FiveM development experience.",
                type: "textarea",
                required: true
            },
            {
                key: "languages",
                label: "Which programming languages and FiveM frameworks are you comfortable with?",
                type: "textarea",
                required: true
            },
            {
                key: "portfolio",
                label: "Provide examples or links to previous development work.",
                type: "textarea",
                required: true
            },
            {
                key: "availability",
                label: "How much time can you normally dedicate to development each week?",
                type: "textarea",
                required: true
            }
        ]
    },

    "Vehicle Developer Application": {
        title: "Vehicle Developer Application",
        description:
            "Apply to work on Union Roleplay's vehicle fleet.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Tell us about your FiveM vehicle development experience.",
                type: "textarea",
                required: true
            },
            {
                key: "skills",
                label: "What vehicle development work can you do? For example liveries, handling, metas, models or optimisation.",
                type: "textarea",
                required: true
            },
            {
                key: "portfolio",
                label: "Provide examples or links to your previous vehicle work.",
                type: "textarea",
                required: true
            },
            {
                key: "availability",
                label: "How often are you available to work on vehicles?",
                type: "textarea",
                required: true
            }
        ]
    },

    "EUP Developer Application": {
        title: "EUP Developer Application",
        description:
            "Apply to develop clothing and uniforms for Union Roleplay.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Tell us about your EUP development experience.",
                type: "textarea",
                required: true
            },
            {
                key: "skills",
                label: "What EUP work can you create or edit?",
                type: "textarea",
                required: true
            },
            {
                key: "portfolio",
                label: "Provide examples or links to your previous EUP work.",
                type: "textarea",
                required: true
            },
            {
                key: "availability",
                label: "How often are you available to work on EUP?",
                type: "textarea",
                required: true
            }
        ]
    },
        "UPD Command Application": {
        title: "UPD Command Application",
        description:
            "Apply for a command position within the Union Police Department.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Tell us about your previous policing and command experience.",
                type: "textarea",
                required: true
            },
            {
                key: "leadership",
                label: "Describe your leadership style.",
                type: "textarea",
                required: true
            },
            {
                key: "plans",
                label: "What would you bring to UPD Command?",
                type: "textarea",
                required: true
            },
            {
                key: "standards",
                label: "How would you maintain high roleplay and policing standards within the department?",
                type: "textarea",
                required: true
            }
        ]
    },

    "UHS Command Application": {
        title: "UHS Command Application",
        description:
            "Apply for a command position within Union Health Service.",
        questions: [
            {
                key: "age",
                label: "How old are you?",
                type: "number",
                required: true
            },
            {
                key: "experience",
                label: "Tell us about your previous medical and command experience.",
                type: "textarea",
                required: true
            },
            {
                key: "leadership",
                label: "Describe your leadership style.",
                type: "textarea",
                required: true
            },
            {
                key: "plans",
                label: "What would you bring to UHS Command?",
                type: "textarea",
                required: true
            },
            {
                key: "standards",
                label: "How would you maintain high medical roleplay and departmental standards?",
                type: "textarea",
                required: true
            }
        ]
    }
};

let currentApplicationType = "";
let currentConfig = null;
let currentQuestionIndex = 0;
let draftApplication = null;
let answers = {};
let autoSaveTimer = null;
let isSaving = false;
let isSubmitting = false;
function getToken() {
    return localStorage.getItem("union_session");
}

function getSelectedApplicationType() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("type") || "";
}

function parseJsonObject(value) {
    if (!value) return {};

    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        return value;
    }

    try {
        const parsed = JSON.parse(value);

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

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function apiRequest(
    path,
    options = {}
) {
    const token = getToken();

    if (!token) {
        throw new Error(
            "You are not logged in."
        );
    }

    const response = await fetch(
        `${APPLY_API}${path}`,
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
        data = await response.json();
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
            "The request could not be completed."
        );
    }

    return data;
}

function setPageMessage(
    title,
    message
) {
    const loading =
        document.getElementById(
            "applicationLoading"
        );

    if (!loading) return;

    loading.hidden = false;

    loading.innerHTML = `
        <h2>${escapeHtml(title)}</h2>

        <p>
            ${escapeHtml(message)}
        </p>
    `;
}

function calculateProgress() {
    if (
        !currentConfig ||
        !currentConfig.questions.length
    ) {
        return 0;
    }

    const completed =
        currentConfig.questions.filter(
            question => {

                const value =
                    answers[question.key];

                return (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                );
            }
        ).length;

    return Math.round(
        (
            completed /
            currentConfig.questions.length
        ) * 100
    );
}
function updateProgress() {
    const progress =
        calculateProgress();

    const fill =
        document.getElementById(
            "applicationProgress"
        );

    const text =
        document.getElementById(
            "applicationProgressText"
        );

    if (fill) {
        fill.style.width =
            `${progress}%`;
    }

    if (text) {
        text.textContent =
            `${progress}% complete`;
    }

    document
        .querySelectorAll(
            ".apply-step"
        )
        .forEach(
            (step, index) => {

                const question =
                    currentConfig.questions[
                        index
                    ];

                const value =
                    answers[
                        question.key
                    ];

                const complete =
                    value !== undefined &&
                    value !== null &&
                    String(value)
                        .trim() !== "";

                step.classList.toggle(
                    "active",
                    index ===
                        currentQuestionIndex
                );

                step.classList.toggle(
                    "complete",
                    complete
                );
            }
        );
}

function renderSteps() {
    const container =
        document.getElementById(
            "applicationSteps"
        );

    if (
        !container ||
        !currentConfig
    ) {
        return;
    }

    container.innerHTML =
        currentConfig.questions
            .map(
                (_, index) => `
                    <button
                        type="button"
                        class="apply-step"
                        data-step-index="${index}"
                    >
                        <span>
                            ${index + 1}
                        </span>

                        <p>
                            Question ${index + 1}
                        </p>
                    </button>
                `
            )
            .join("");

    container
        .querySelectorAll(
            "[data-step-index]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    saveCurrentInput();

                    const nextIndex =
                        Number(
                            button.dataset
                                .stepIndex
                        );

                    if (
                        !Number.isInteger(
                            nextIndex
                        )
                    ) {
                        return;
                    }

                    currentQuestionIndex =
                        nextIndex;

                    renderCurrentQuestion();
                    updateProgress();

                    try {
                        await saveDraft();
                    } catch (error) {
                        console.warn(
                            "Draft save failed:",
                            error
                        );
                    }
                }
            );

        });
}

function createQuestionInput(
    question
) {
    let input;

    if (
        question.type ===
        "textarea"
    ) {
        input =
            document.createElement(
                "textarea"
            );

        input.rows = 8;

        input.placeholder =
            "Write your answer here...";

    } else {

        input =
            document.createElement(
                "input"
            );

        input.type =
            question.type || "text";

        input.placeholder =
            "Enter your answer...";
    }

    input.id =
        `application-${question.key}`;

    input.name =
        question.key;

    input.required =
        question.required === true;

    input.autocomplete = "off";

    input.value =
        answers[question.key] ?? "";

    input.addEventListener(
        "input",
        () => {

            answers[question.key] =
                input.value;

            updateProgress();

            scheduleAutoSave();
        }
    );

    return input;
}

function renderCurrentQuestion() {
    const container =
        document.getElementById(
            "applicationQuestions"
        );

    if (
        !container ||
        !currentConfig
    ) {
        return;
    }

    const question =
        currentConfig.questions[
            currentQuestionIndex
        ];

    if (!question) return;

    container.innerHTML = "";

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "apply-question";

    const counter =
        document.createElement(
            "span"
        );

    counter.className =
        "apply-question-counter";

    counter.textContent =
        `Question ${currentQuestionIndex + 1} of ${currentConfig.questions.length}`;

    const label =
        document.createElement(
            "label"
        );

    label.setAttribute(
        "for",
        `application-${question.key}`
    );

    label.textContent =
        question.label;

    if (question.required) {

        const required =
            document.createElement(
                "span"
            );

        required.className =
            "apply-required";

        required.textContent =
            " Required";

        label.appendChild(
            required
        );
    }

    const input =
        createQuestionInput(
            question
        );

    wrapper.appendChild(
        counter
    );

    wrapper.appendChild(
        label
    );

    wrapper.appendChild(
        input
    );

    container.appendChild(
        wrapper
    );

    const previous =
        document.getElementById(
            "previousQuestion"
        );

    const next =
        document.getElementById(
            "nextQuestion"
        );

    const submit =
        document.getElementById(
            "submitApplication"
        );

    if (previous) {
        previous.hidden =
            currentQuestionIndex === 0;
    }

    const isLast =
        currentQuestionIndex ===
        currentConfig.questions.length - 1;

    if (next) {
        next.hidden =
            isLast;
    }

    if (submit) {
        submit.hidden =
            !isLast;
    }

    requestAnimationFrame(
        () => {
            input.focus();
        }
    );
}
function getCurrentInput() {
    if (!currentConfig) {
        return null;
    }

    const question =
        currentConfig.questions[
            currentQuestionIndex
        ];

    if (!question) {
        return null;
    }

    return document.getElementById(
        `application-${question.key}`
    );
}

function saveCurrentInput() {
    if (!currentConfig) {
        return;
    }

    const question =
        currentConfig.questions[
            currentQuestionIndex
        ];

    const input =
        getCurrentInput();

    if (
        !question ||
        !input
    ) {
        return;
    }

    answers[question.key] =
        input.value;
}

function validateCurrentQuestion() {
    if (!currentConfig) {
        return false;
    }

    const question =
        currentConfig.questions[
            currentQuestionIndex
        ];

    const input =
        getCurrentInput();

    if (
        !question ||
        !input
    ) {
        return false;
    }

    saveCurrentInput();

    if (
        question.required &&
        String(
            input.value || ""
        ).trim() === ""
    ) {
        input.focus();

        input.setCustomValidity(
            "Please answer this question before continuing."
        );

        input.reportValidity();

        input.setCustomValidity("");

        return false;
    }

    if (!input.checkValidity()) {
        input.reportValidity();
        return false;
    }

    return true;
}

function validateAllQuestions() {
    if (!currentConfig) {
        return false;
    }

    for (
        let index = 0;
        index <
        currentConfig.questions.length;
        index++
    ) {
        const question =
            currentConfig.questions[
                index
            ];

        const value =
            answers[
                question.key
            ];

        if (
            question.required &&
            (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            )
        ) {
            currentQuestionIndex =
                index;

            renderCurrentQuestion();
            updateProgress();

            const input =
                getCurrentInput();

            if (input) {
                input.focus();

                input.setCustomValidity(
                    "Please answer this question before submitting."
                );

                input.reportValidity();

                input.setCustomValidity("");
            }

            return false;
        }
    }

    return true;
}

async function createOrLoadDraft() {
    const data =
        await apiRequest(
            "/api/applications/create",
            {
                method: "POST",

                body: JSON.stringify({
                    application_type:
                        currentApplicationType
                })
            }
        );

    draftApplication =
        data.application || null;

    if (draftApplication) {
        answers =
            parseJsonObject(
                draftApplication.data
            );
    }

    return draftApplication;
}

async function saveDraft() {
    if (
        !currentApplicationType ||
        !draftApplication ||
        isSaving ||
        isSubmitting
    ) {
        return;
    }

    saveCurrentInput();

    isSaving = true;

    try {
        await apiRequest(
            "/api/applications/save",
            {
                method: "POST",

                body: JSON.stringify({
                    application_type:
                        currentApplicationType,

                    data:
                        answers,

                    progress:
                        calculateProgress()
                })
            }
        );

    } finally {

        isSaving = false;
    }
}

function scheduleAutoSave() {
    if (autoSaveTimer) {
        clearTimeout(
            autoSaveTimer
        );
    }

    autoSaveTimer =
        setTimeout(
            () => {

                saveDraft()
                    .catch(
                        error => {
                            console.warn(
                                "Automatic draft save failed:",
                                error
                            );
                        }
                    );

            },
            750
        );
}
async function submitApplication() {
    if (isSubmitting) {
        return;
    }

    saveCurrentInput();

    if (!validateAllQuestions()) {
        return;
    }

    const button =
        document.getElementById(
            "submitApplication"
        );

    isSubmitting = true;

    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
    }

    if (button) {
        button.disabled = true;
        button.textContent =
            "Submitting...";
    }

    try {
        const data =
            await apiRequest(
                "/api/applications/submit",
                {
                    method: "POST",

                    body: JSON.stringify({
                        application_type:
                            currentApplicationType,

                        data:
                            answers,

                        progress:
                            100
                    })
                }
            );

        const form =
            document.getElementById(
                "applicationForm"
            );

        const success =
            document.getElementById(
                "applicationSuccess"
            );

        if (form) {
            form.hidden = true;
        }

        if (success) {
            success.hidden = false;

            const reference =
                data.application?.reference;

            if (reference) {
                const paragraph =
                    success.querySelector("p");

                if (paragraph) {
                    paragraph.innerHTML = `
                        Your application has been sent to
                        Union Roleplay staff for review.
                        <br><br>
                        <strong>
                            Reference:
                            ${escapeHtml(reference)}
                        </strong>
                    `;
                }
            }
        }

        const fill =
            document.getElementById(
                "applicationProgress"
            );

        const text =
            document.getElementById(
                "applicationProgressText"
            );

        if (fill) {
            fill.style.width =
                "100%";
        }

        if (text) {
            text.textContent =
                "100% complete";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        alert(
            error.message ||
            "Your application could not be submitted."
        );

        if (button) {
            button.disabled = false;
            button.textContent =
                "Submit Application";
        }

    } finally {

        isSubmitting = false;
    }
}
async function initialiseApplicationForm() {
    currentApplicationType =
        getSelectedApplicationType();

    currentConfig =
        APPLICATION_CONFIG[
            currentApplicationType
        ] || null;

    const loading =
        document.getElementById(
            "applicationLoading"
        );

    const loginRequired =
        document.getElementById(
            "applicationLoginRequired"
        );

    const form =
        document.getElementById(
            "applicationForm"
        );

    const title =
        document.getElementById(
            "applicationTitle"
        );

    const description =
        document.getElementById(
            "applicationDescription"
        );

    const loginButton =
        document.getElementById(
            "applyLoginButton"
        );

    if (loginButton) {
        loginButton.addEventListener(
            "click",
            event => {
                event.preventDefault();

                window.location.href =
                    DISCORD_LOGIN_URL;
            }
        );
    }

    if (!currentConfig) {
        if (title) {
            title.textContent =
                "Application unavailable";
        }

        if (description) {
            description.textContent =
                "This application type could not be found.";
        }

        setPageMessage(
            "Application unavailable",
            "Return to the Applications page and choose a valid application."
        );

        return;
    }

    if (title) {
        title.textContent =
            currentConfig.title;
    }

    if (description) {
        description.textContent =
            currentConfig.description;
    }

    if (!window.UnionAuth) {
        setPageMessage(
            "Unable to load application",
            "The authentication system is unavailable."
        );

        return;
    }

    const user =
        await UnionAuth.getCurrentUser();

    if (!user) {
        if (loading) {
            loading.hidden = true;
        }

        if (loginRequired) {
            loginRequired.hidden = false;
        }

        return;
    }

    try {
        await createOrLoadDraft();

        currentQuestionIndex = 0;

        renderSteps();
        renderCurrentQuestion();
        updateProgress();

        if (loading) {
            loading.hidden = true;
        }

        if (loginRequired) {
            loginRequired.hidden = true;
        }

        if (form) {
            form.hidden = false;
        }

    } catch (error) {

        console.error(
            "Application setup failed:",
            error
        );

        setPageMessage(
            "Unable to prepare application",
            error.message ||
            "The application could not be prepared."
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const previous =
            document.getElementById(
                "previousQuestion"
            );

        const next =
            document.getElementById(
                "nextQuestion"
            );

        const form =
            document.getElementById(
                "applicationForm"
            );

        if (previous) {
            previous.addEventListener(
                "click",
                async () => {

                    saveCurrentInput();

                    if (
                        currentQuestionIndex >
                        0
                    ) {
                        currentQuestionIndex--;

                        renderCurrentQuestion();
                        updateProgress();

                        try {
                            await saveDraft();
                        } catch (error) {
                            console.warn(
                                "Draft save failed:",
                                error
                            );
                        }
                    }
                }
            );
        }

        if (next) {
            next.addEventListener(
                "click",
                async () => {

                    if (
                        !validateCurrentQuestion()
                    ) {
                        return;
                    }

                    try {
                        await saveDraft();
                    } catch (error) {
                        console.warn(
                            "Draft save failed:",
                            error
                        );
                    }

                    if (
                        currentQuestionIndex <
                        currentConfig.questions.length - 1
                    ) {
                        currentQuestionIndex++;

                        renderCurrentQuestion();
                        updateProgress();
                    }
                }
            );
        }

        if (form) {
            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    await submitApplication();
                }
            );
        }

        initialiseApplicationForm();
    }
);

window.addEventListener(
    "beforeunload",
    () => {
        saveCurrentInput();
    }
);