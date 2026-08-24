const APPLY_API =
    "https://the-district-api.danielclifford2808.workers.dev";


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
            "The District operates a strict whitelist. Take your time and provide detailed, original answers. Low-effort, copied or AI-generated applications may be declined.",

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
                    "What is your character's full name and backstory? Tell us about their previous life, personality, experiences, motivations and what has brought them to The District.",
                type: "textarea",
                required: true
            },

            {
                key: "characterPlans",
                label:
                    "What are your plans for your character within The District? Explain the type of story you want to create and what you would like your character to achieve over time.",
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
                    "Why should we accept you into The District? Tell us what you can bring to the server and what we can expect from you as a member of the community.",
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
            "Apply to join The District staff team. We are looking for mature, fair and trustworthy people who can maintain our community standards.",

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
                    "Why do you want to join The District staff team, and why should we choose you over another applicant?",
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
            "Apply to test scripts, systems and updates before they reach the live The District server.",

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
                    "Why do you want to become a QA Tester for The District?",
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
            "Apply to manage The District's social media presence and coordinate the wider media team.",

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
                    "Which social media platforms are you most experienced with, and what type of content would you use on each platform for The District?",
                type: "textarea",
                required: true
            },

            {
                key: "growthStrategy",
                label:
                    "If The District's social media engagement was low, what would you do to improve reach and attract new members without relying on spam?",
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
                    "A member of the Media Team submits content that does not meet the quality expected for The District. How would you handle it?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How frequently would you be available to manage The District's social media and coordinate the Media Team?",
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
            "Apply to create screenshots, videos, trailers and promotional content for The District.",

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
                    "How often would you realistically be available to create media for The District?",
                type: "textarea",
                required: true
            }

        ]
    },


    /* ==========================================================
       STREAMER APPLICATION
    ========================================================== */

    "Streamer Application": {

        title:
            "Streamer Application",

        description:
            "Apply to join The District Streamer Programme. Every accepted creator starts as a District Community Streamer. You must stream at least 2 times per week or 12 hours per month, promote The District through good-quality roleplay, remain consistently active, avoid repeated or serious rule breaches, and have no disciplinary reports within the month before applying.",

        questions: [

            {
                key: "age",
                label:
                    "How old are you?",
                type: "number",
                required: true
            },

            {
                key: "channelDetails",
                label:
                    "What name do you create content under, which platform or platforms do you stream on, and what are your channel links?",
                type: "textarea",
                required: true
            },

            {
                key: "streamingExperience",
                label:
                    "Tell us about your previous streaming or content creation experience, including the type of content you normally create.",
                type: "textarea",
                required: true
            },

            {
                key: "audience",
                label:
                    "Tell us about your current audience. Include your approximate follower count, average live viewers or typical video views where relevant.",
                type: "textarea",
                required: true
            },

            {
                key: "schedule",
                label:
                    "The programme requires a minimum of 2 streams per week or 12 hours per month. Which requirement will you meet, and what would your usual streaming schedule look like?",
                type: "textarea",
                required: true
            },

            {
                key: "serverActivity",
                label:
                    "How active are you currently within The District, and how will you make sure you remain consistently active while part of the Streamer Programme?",
                type: "textarea",
                required: true
            },

            {
                key: "disciplinaryHistory",
                label:
                    "Please confirm whether you have had any disciplinary reports within the last month or any repeated or serious rule breaches. If yes, explain what happened.",
                type: "textarea",
                required: true
            },

            {
                key: "contentStyle",
                label:
                    "What type of content would you create in The District, and how would you promote the server through good-quality roleplay without damaging serious roleplay?",
                type: "textarea",
                required: true
            },

            {
                key: "communityStandards",
                label:
                    "As an official creator you would represent The District publicly. How would you handle rule breaks, conflict, stream sniping or other situations that could affect the community's reputation?",
                type: "textarea",
                required: true
            },

            {
                key: "clips",
                label:
                    "Provide links to at least three examples of your previous streams, clips, videos or other content that best represents your work.",
                type: "textarea",
                required: true
            },

            {
                key: "whyCreator",
                label:
                    "Why do you want to become a District Community Streamer, and what would you bring to the Streamer Programme?",
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
            "Apply to help develop, maintain and improve scripts and systems used by The District.",

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
                    "How much time can you realistically dedicate to The District development each week?",
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
            "Apply to develop, maintain and optimise vehicles used throughout The District.",

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
                    "How would you make sure vehicles you add to The District match our British theme and quality standards?",
                type: "textarea",
                required: true
            },

            {
                key: "availability",
                label:
                    "How often are you realistically available to work on The District vehicle fleet?",
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
            "Apply to create and maintain uniforms, clothing and department assets used throughout The District.",

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
                    "You are asked to create a new uniform pack for one of The District's emergency services. Explain how you would plan the pack and keep it consistent with the department.",
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
                    "How often are you realistically available to work on The District EUP?",
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
            "Apply for a senior leadership position within District Police. Command applicants are expected to demonstrate strong leadership, realistic policing standards and the ability to manage officers fairly.",

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
                    "Describe your leadership style and how you would apply it when managing officers within District Police.",
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
                    "How would you ensure District Police creates good roleplay for civilians rather than focusing solely on winning pursuits, arrests or incidents?",
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
                    "How active can you realistically be within District Police, and how much time can you commit to command responsibilities?",
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
            "Apply for a senior leadership position within District Health Service. Command applicants should demonstrate strong leadership and a commitment to high-quality medical roleplay.",

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
                    "Describe your leadership style and how you would apply it while managing members of District Health Service.",
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
                    "How active can you realistically be within District Health Service, and how much time can you commit to command responsibilities?",
                type: "textarea",
                required: true
            }

        ]
    }

};

/* ==========================================================
   APPLICATION QUALITY REQUIREMENTS
========================================================== */

const APPLICATION_MINIMUM_LENGTHS = {

    "Whitelist Application": {
        roleplayExperience: 150,
        characterBackstory: 400,
        characterPlans: 180,
        collisionScenario: 220,
        policeScenario: 220,
        lossScenario: 180,
        rulebreakScenario: 180,
        whyUnion: 180
    },

    "Staff Application": {
        staffExperience: 150,
        whyStaff: 180,
        strengthsWeaknesses: 150,
        staffConflict: 220,
        friendScenario: 180,
        staffMisconduct: 200,
        availability: 100
    },

    "QA Tester Application": {
        testingExperience: 120,
        whyQa: 140,
        bugReport: 220,
        reproduction: 160,
        confidentiality: 140,
        availability: 100
    },

    "Social Media Manager Application": {
        experience: 150,
        portfolio: 80,
        platforms: 180,
        growthStrategy: 220,
        mediaManagement: 200,
        qualityControl: 180,
        availability: 100
    },

    "Media Application": {
        experience: 120,
        portfolio: 60,
        software: 80,
        mediaScenario: 180,
        feedback: 150,
        availability: 100
    },

    "Streamer Application": {
        channelDetails: 80,
        streamingExperience: 120,
        audience: 60,
        schedule: 80,
        serverActivity: 100,
        disciplinaryHistory: 40,
        contentStyle: 160,
        communityStandards: 160,
        clips: 60,
        whyCreator: 140
    },


    "Script Developer Application": {
        experience: 150,
        languages: 120,
        frameworkExperience: 150,
        portfolio: 60,
        debugScenario: 220,
        security: 200,
        availability: 100
    },

    "Vehicle Developer Application": {
        experience: 120,
        skills: 140,
        software: 80,
        portfolio: 60,
        optimisationScenario: 200,
        standards: 160,
        availability: 100
    },

    "EUP Developer Application": {
        experience: 120,
        skills: 140,
        software: 80,
        portfolio: 60,
        departmentScenario: 200,
        optimisation: 160,
        availability: 100
    },

    "UPD Command Application": {
        policeExperience: 180,
        leadershipStyle: 220,
        departmentPlans: 220,
        officerStandards: 250,
        misconductScenario: 250,
        roleplayStandards: 220,
        commandConflict: 220,
        availability: 120
    },

    "UHS Command Application": {
        medicalExperience: 180,
        leadershipStyle: 220,
        departmentPlans: 220,
        medicalStandards: 220,
        staffPerformance: 250,
        majorIncident: 250,
        commandConflict: 220,
        availability: 120
    }
};


function getQuestionMinimumLength(question) {

    if (!question || question.type === "number") {
        return 0;
    }

    return Number(
        APPLICATION_MINIMUM_LENGTHS[
            currentApplicationType
        ]?.[question.key] || 0
    );
}


function getAnswerLength(value) {

    return String(value ?? "")
        .trim()
        .length;
}


function isQuestionComplete(question, value) {

    const answerLength =
        getAnswerLength(value);

    if (
        question.required &&
        answerLength === 0
    ) {
        return false;
    }

    const minimumLength =
        getQuestionMinimumLength(question);

    if (
        minimumLength > 0 &&
        answerLength < minimumLength
    ) {
        return false;
    }

    return true;
}


function updateCharacterCounter(question, input) {

    const counter =
        document.getElementById(
            "applicationCharacterCounter"
        );

    if (!counter) {
        return;
    }

    const minimumLength =
        getQuestionMinimumLength(question);

    if (minimumLength <= 0) {
        counter.hidden = true;
        return;
    }

    const currentLength =
        getAnswerLength(input?.value);

    counter.hidden = false;

    counter.classList.toggle(
        "requirement-met",
        currentLength >= minimumLength
    );

    counter.classList.toggle(
        "requirement-pending",
        currentLength < minimumLength
    );

    if (currentLength >= minimumLength) {

        counter.innerHTML = `
            <span class="application-character-check">✓</span>
            Minimum requirement met
            <strong>${currentLength}</strong>
            characters
        `;

        return;
    }

    counter.innerHTML = `
        <strong>${currentLength}</strong>
        /
        <strong>${minimumLength}</strong>
        minimum characters
    `;
}



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
        "district_session"
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

                return isQuestionComplete(
                    question,
                    value
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
                    isQuestionComplete(
                        question,
                        value
                    );

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


    const minimumLength =
        getQuestionMinimumLength(question);


    if (
        minimumLength > 0 &&
        (
            input.tagName === "TEXTAREA" ||
            input.type === "text"
        )
    ) {
        input.minLength =
            minimumLength;
    }


    input.autocomplete = "off";

    input.value =
        answers[question.key] ?? "";

    input.addEventListener(
        "input",
        () => {

            answers[question.key] =
                input.value;

            updateProgress();

            updateCharacterCounter(
                question,
                input
            );

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


    const minimumLength =
        getQuestionMinimumLength(question);


    if (minimumLength > 0) {

        const requirement =
            document.createElement(
                "div"
            );

        requirement.className =
            "application-answer-requirement";


        const requirementText =
            document.createElement(
                "span"
            );

        requirementText.className =
            "application-answer-guidance";

        requirementText.textContent =
            question.key === "characterBackstory"
                ? "Detailed, original answers are expected. AI-generated or copied backstories may be declined."
                : "Give a detailed answer that properly addresses the question.";


        const counter =
            document.createElement(
                "span"
            );

        counter.id =
            "applicationCharacterCounter";

        counter.className =
            "application-character-counter";


        requirement.appendChild(
            requirementText
        );

        requirement.appendChild(
            counter
        );

        wrapper.appendChild(
            requirement
        );


        updateCharacterCounter(
            question,
            input
        );
    }


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

    const minimumLength =
        getQuestionMinimumLength(question);

    const answerLength =
        getAnswerLength(input.value);


    if (
        minimumLength > 0 &&
        answerLength < minimumLength
    ) {

        input.focus();

        input.setCustomValidity(
            `Your answer needs more detail. Please write at least ${minimumLength} characters. You currently have ${answerLength}.`
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


        const minimumLength =
            getQuestionMinimumLength(question);

        const answerLength =
            getAnswerLength(value);


        if (
            minimumLength > 0 &&
            answerLength < minimumLength
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
                    `Your answer needs more detail. Please write at least ${minimumLength} characters. You currently have ${answerLength}.`
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
                        The District staff for review.

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


    if (!window.DistrictAuth) {

        setPageMessage(
            "Unable to load application",
            "The authentication system is unavailable."
        );

        return;
    }


    const user =
        await DistrictAuth.getCurrentUser();


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