const APPLY_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";


const DISCORD_LOGIN_URL =
    `${APPLY_API}/api/auth/discord`;


const APPLICATION_CONFIG = {


    /* ==========================================================
       WHITELIST APPLICATION
    ========================================================== */

    "Whitelist Application": {

        title:
            "Whitelist Application",

        description:
            "Union Roleplay operates a strict whitelist. Take your time and provide detailed, original answers. Low-effort, copied or AI-generated applications may be declined.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "roleplayExperience",
                label:
                    "Tell us about your previous roleplay experience. Include how long you have been roleplaying, previous FiveM communities you have been part of and the type of roleplay you are used to.",
                type: "textarea",
                required: true
            },

            {
                key: "characterBackstory",
                label:
                    "What is your character's full name and backstory? Tell us about their previous life, personality, experiences, motivations and what has brought them to Union.",
                type: "textarea",
                required: true
            },

            {
                key: "characterPlans",
                label:
                    "What are your plans for your character within Union Roleplay? Explain the type of story you want to create and what you would like your character to achieve over time.",
                type: "textarea",
                required: true
            },

            {
                key: "collisionScenario",
                label:
                    "Your character is involved in a serious high-speed vehicle collision. Explain how you would roleplay the situation, including your injuries and how the incident could affect your character afterwards.",
                type: "textarea",
                required: true
            },

            {
                key: "policeScenario",
                label:
                    "Police stop your vehicle and you know there are illegal items inside. Explain how you would approach the situation and create enjoyable roleplay for everyone involved.",
                type: "textarea",
                required: true
            },

            {
                key: "lossScenario",
                label:
                    "A roleplay situation does not go your way and results in your character being arrested or losing a large amount of money or items. How would you react and continue the roleplay?",
                type: "textarea",
                required: true
            },

            {
                key: "rulebreakScenario",
                label:
                    "During an active roleplay situation, you believe another player has broken a server rule. Explain what you would do and how you would handle the situation.",
                type: "textarea",
                required: true
            },

            {
                key: "whyUnion",
                label:
                    "Why should we accept you into Union Roleplay? Tell us what you can bring to the server and what we can expect from you as a member of the community.",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       STAFF APPLICATION
    ========================================================== */

    "Staff Application": {

        title:
            "Staff Application",

        description:
            "Apply to join the Union Roleplay staff team. We are looking for mature, fair and trustworthy people who can maintain our community standards.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "staffExperience",
                label:
                    "Tell us about any previous staff or community management experience you have. Include your previous positions, responsibilities and what you learnt from them.",
                type: "textarea",
                required: true
            },

            {
                key: "whyStaff",
                label:
                    "Why do you want to join the Union Roleplay staff team, and why should we choose you over another applicant?",
                type: "textarea",
                required: true
            },

            {
                key: "strengthsWeaknesses",
                label:
                    "What are your main strengths and weaknesses when working as part of a staff team?",
                type: "textarea",
                required: true
            },

            {
                key: "staffConflict",
                label:
                    "Two players are arguing in a staff situation. Both have different versions of events and both are blaming each other. Explain exactly how you would handle the situation.",
                type: "textarea",
                required: true
            },

            {
                key: "friendScenario",
                label:
                    "You witness a close friend breaking a serious server rule. Nobody else has noticed. What would you do and why?",
                type: "textarea",
                required: true
            },

            {
                key: "staffMisconduct",
                label:
                    "You believe another member of staff is abusing their permissions or treating players unfairly. How would you handle this?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How active can you realistically be each week, and are there any days or times when you are normally unavailable?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       QA TESTER APPLICATION
    ========================================================== */

    "QA Tester Application": {

        title:
            "QA Tester Application",

        description:
            "Apply to test scripts, systems and updates before they reach the live Union Roleplay server.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "testingExperience",
                label:
                    "Tell us about any previous QA, FiveM testing or bug-reporting experience you have.",
                type: "textarea",
                required: true
            },

            {
                key: "whyQa",
                label:
                    "Why do you want to become a QA Tester for Union Roleplay?",
                type: "textarea",
                required: true
            },

            {
                key: "bugReport",
                label:
                    "You discover that a new script occasionally causes players to lose an item when it should not. Explain exactly how you would test and report this issue to a developer.",
                type: "textarea",
                required: true
            },

            {
                key: "reproduction",
                label:
                    "A developer tells you they cannot reproduce a bug you reported. What would you do next?",
                type: "textarea",
                required: true
            },

            {
                key: "confidentiality",
                label:
                    "As a QA Tester you may see unreleased scripts, features and information. How would you handle this information?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "When are you normally available to test, and how quickly could you respond when a developer needs something tested?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       SOCIAL MEDIA MANAGER
    ========================================================== */

    "Social Media Manager Application": {

        title:
            "Social Media Manager Application",

        description:
            "Apply to manage Union Roleplay's social media presence and coordinate the wider media team.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "experience",
                label:
                    "Describe your previous social media, content creation or FiveM media experience.",
                type: "textarea",
                required: true
            },

            {
                key: "portfolio",
                label:
                    "Provide at least three examples of previous FiveM media you have created or managed. Include links where possible.",
                type: "textarea",
                required: true
            },

            {
                key: "platforms",
                label:
                    "Which social media platforms are you most experienced with, and what type of content would you use on each platform for Union Roleplay?",
                type: "textarea",
                required: true
            },

            {
                key: "growthStrategy",
                label:
                    "If Union Roleplay's social media engagement was low, what would you do to improve reach and attract new members without relying on spam?",
                type: "textarea",
                required: true
            },

            {
                key: "mediaManagement",
                label:
                    "How would you organise the Media Team, assign content requests and make sure content is completed on time?",
                type: "textarea",
                required: true
            },

            {
                key: "qualityControl",
                label:
                    "A member of the Media Team submits content that does not meet the quality expected for Union Roleplay. How would you handle it?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How frequently would you be available to manage Union Roleplay's social media and coordinate the Media Team?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       MEDIA TEAM
    ========================================================== */

    "Media Application": {

        title:
            "Media Team Application",

        description:
            "Apply to create screenshots, videos, trailers and promotional content for Union Roleplay.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "experience",
                label:
                    "Tell us about your previous FiveM, photography, video editing or other media experience.",
                type: "textarea",
                required: true
            },

            {
                key: "portfolio",
                label:
                    "Provide examples of your previous media work. Links to FiveM screenshots, videos or edits are preferred.",
                type: "textarea",
                required: true
            },

            {
                key: "software",
                label:
                    "What software do you currently use for capturing and editing screenshots or videos?",
                type: "textarea",
                required: true
            },

            {
                key: "mediaScenario",
                label:
                    "You are asked to create promotional content for a major server update. Explain how you would plan and create the content.",
                type: "textarea",
                required: true
            },

            {
                key: "feedback",
                label:
                    "A piece of media you spent a lot of time creating is rejected and you are asked to redo it. How would you respond?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How often would you realistically be available to create media for Union Roleplay?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       SCRIPT DEVELOPER
    ========================================================== */

    "Script Developer Application": {

        title:
            "Script Developer Application",

        description:
            "Apply to help develop, maintain and improve scripts and systems used by Union Roleplay.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "experience",
                label:
                    "Tell us about your FiveM development experience, including how long you have been developing.",
                type: "textarea",
                required: true
            },

            {
                key: "languages",
                label:
                    "Which programming languages, libraries and FiveM frameworks are you comfortable working with?",
                type: "textarea",
                required: true
            },

            {
                key: "frameworkExperience",
                label:
                    "Describe your experience with QBOX/QBCore, ox_lib, ox_inventory, ox_target or similar FiveM resources.",
                type: "textarea",
                required: true
            },

            {
                key: "portfolio",
                label:
                    "Provide examples, GitHub repositories, videos or other evidence of previous development work.",
                type: "textarea",
                required: true
            },

            {
                key: "debugScenario",
                label:
                    "A script works perfectly on your development server but throws errors when deployed to the live server. Explain how you would approach diagnosing the problem.",
                type: "textarea",
                required: true
            },

            {
                key: "security",
                label:
                    "What steps would you take when developing a script that handles money, inventory items or other sensitive server data?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How much time can you realistically dedicate to Union Roleplay development each week?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       VEHICLE DEVELOPER
    ========================================================== */

    "Vehicle Developer Application": {

        title:
            "Vehicle Developer Application",

        description:
            "Apply to develop, maintain and optimise vehicles used throughout Union Roleplay.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "experience",
                label:
                    "Tell us about your previous FiveM vehicle development experience.",
                type: "textarea",
                required: true
            },

            {
                key: "skills",
                label:
                    "What areas of vehicle development can you confidently work on? For example liveries, handling, metas, models, lighting or optimisation.",
                type: "textarea",
                required: true
            },

            {
                key: "software",
                label:
                    "Which programs and tools do you normally use when creating or editing FiveM vehicles?",
                type: "textarea",
                required: true
            },

            {
                key: "portfolio",
                label:
                    "Provide examples or links to previous vehicles, liveries or other vehicle-development work you have completed.",
                type: "textarea",
                required: true
            },

            {
                key: "optimisationScenario",
                label:
                    "You are given a vehicle that looks good but performs poorly and causes noticeable client FPS loss. How would you approach the problem?",
                type: "textarea",
                required: true
            },

            {
                key: "standards",
                label:
                    "How would you make sure vehicles you add to Union match our British theme and quality standards?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How often are you realistically available to work on the Union Roleplay vehicle fleet?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       EUP DEVELOPER
    ========================================================== */

    "EUP Developer Application": {

        title:
            "EUP Developer Application",

        description:
            "Apply to create and maintain uniforms, clothing and department assets used throughout Union Roleplay.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "experience",
                label:
                    "Tell us about your previous EUP or FiveM clothing development experience.",
                type: "textarea",
                required: true
            },

            {
                key: "skills",
                label:
                    "What EUP work can you confidently create or edit? Include texturing, models, components, props or other relevant skills.",
                type: "textarea",
                required: true
            },

            {
                key: "software",
                label:
                    "Which programs and tools do you normally use for EUP development?",
                type: "textarea",
                required: true
            },

            {
                key: "portfolio",
                label:
                    "Provide examples or links to previous uniforms, clothing or EUP work you have created.",
                type: "textarea",
                required: true
            },

            {
                key: "departmentScenario",
                label:
                    "You are asked to create a new uniform pack for one of Union's emergency services. Explain how you would plan the pack and keep it consistent with the department.",
                type: "textarea",
                required: true
            },

            {
                key: "optimisation",
                label:
                    "What would you consider when making sure an EUP pack is organised and suitable for use on a live FiveM server?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How often are you realistically available to work on Union Roleplay EUP?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       UPD COMMAND
    ========================================================== */

    "UPD Command Application": {

        title:
            "UPD Command Application",

        description:
            "Apply for a senior leadership position within Union Police. Command applicants are expected to demonstrate strong leadership, realistic policing standards and the ability to manage officers fairly.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "policeExperience",
                label:
                    "Tell us about your previous FiveM policing experience, including any supervisory or command positions you have held.",
                type: "textarea",
                required: true
            },

            {
                key: "leadershipStyle",
                label:
                    "Describe your leadership style and how you would apply it when managing officers within Union Police.",
                type: "textarea",
                required: true
            },

            {
                key: "departmentPlans",
                label:
                    "What would you bring to UPD Command, and what would your priorities be during your first few weeks?",
                type: "textarea",
                required: true
            },

            {
                key: "officerStandards",
                label:
                    "An experienced officer repeatedly performs poorly but is popular within the department. How would you handle the situation?",
                type: "textarea",
                required: true
            },

            {
                key: "misconductScenario",
                label:
                    "You receive a serious complaint alleging that one of your supervisors has abused their position during a roleplay situation. Explain how you would deal with it.",
                type: "textarea",
                required: true
            },

            {
                key: "roleplayStandards",
                label:
                    "How would you ensure Union Police creates good roleplay for civilians rather than focusing solely on winning pursuits, arrests or incidents?",
                type: "textarea",
                required: true
            },

            {
                key: "commandConflict",
                label:
                    "You strongly disagree with another command member about a major departmental decision. How would you handle the disagreement?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How active can you realistically be within Union Police, and how much time can you commit to command responsibilities?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       UHS COMMAND
    ========================================================== */

    "UHS Command Application": {

        title:
            "UHS Command Application",

        description:
            "Apply for a senior leadership position within Union Health Service. Command applicants should demonstrate strong leadership and a commitment to high-quality medical roleplay.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "medicalExperience",
                label:
                    "Tell us about your previous FiveM medical roleplay experience, including any supervisory or command positions you have held.",
                type: "textarea",
                required: true
            },

            {
                key: "leadershipStyle",
                label:
                    "Describe your leadership style and how you would apply it while managing members of Union Health Service.",
                type: "textarea",
                required: true
            },

            {
                key: "departmentPlans",
                label:
                    "What would you bring to UHS Command, and what would your priorities be during your first few weeks?",
                type: "textarea",
                required: true
            },

            {
                key: "medicalStandards",
                label:
                    "How would you maintain realistic and high-quality medical roleplay across the department?",
                type: "textarea",
                required: true
            },

            {
                key: "staffPerformance",
                label:
                    "A long-serving member of UHS repeatedly provides poor medical roleplay despite previous guidance. How would you handle the situation?",
                type: "textarea",
                required: true
            },

            {
                key: "majorIncident",
                label:
                    "A major incident occurs with several casualties and limited medical resources available. As a command member, how would you organise the response?",
                type: "textarea",
                required: true
            },

            {
                key: "commandConflict",
                label:
                    "You strongly disagree with another command member about how the department should operate. How would you resolve the disagreement professionally?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How active can you realistically be within Union Health Service, and how much time can you commit to command responsibilities?",
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
    return localStorage.getItem(
        "union_session"
    );
}


function getSelectedApplicationType() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("type") || "";
}


function parseJsonObject(value) {

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

    const token =
        getToken();

    if (!token) {
        throw new Error(
            "You are not logged in."
        );
    }

    const response =
        await fetch(
            `${APPLY_API}${path}`,
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

    if (!loading) {
        return;
    }

    loading.hidden = false;

    loading.innerHTML = `
        <h2>
            ${escapeHtml(title)}
        </h2>

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
                    answers[
                        question.key
                    ];

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

    if (!currentConfig) {
        return;
    }

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
                    "completed",
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

                        <span class="apply-step-number">
                            ${index + 1}
                        </span>

                        <span>
                            Question ${index + 1}
                        </span>

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
                            button.dataset.stepIndex
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

    if (!question) {
        return;
    }

    container.innerHTML = "";


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "application-question";


    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "application-question-meta";


    const counter =
        document.createElement(
            "span"
        );

    counter.className =
        "application-question-number";

    counter.textContent =
        `Question ${currentQuestionIndex + 1} of ${currentConfig.questions.length}`;

    meta.appendChild(
        counter
    );


    if (question.required) {

        const required =
            document.createElement(
                "span"
            );

        required.className =
            "application-required";

        required.textContent =
            "Required";

        meta.appendChild(
            required
        );
    }


    const heading =
        document.createElement(
            "h2"
        );

    heading.textContent =
        question.label;


    const input =
        createQuestionInput(
            question
        );


    wrapper.appendChild(
        meta
    );

    wrapper.appendChild(
        heading
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

        clearTimeout(
            autoSaveTimer
        );

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
                    success.querySelector(
                        "p"
                    );

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