/* ==========================================================
   THE DISTRICT — BUSINESS OWNERSHIP / MANAGED FORM FALLBACK
   This file now also provides compatibility for questions made
   through the Staff Application Manager.
========================================================== */

if (!APPLICATION_CONFIG["Business Ownership Application"]) {
    APPLICATION_CONFIG["Business Ownership Application"] = {
        title: "Business Ownership Application",
        description:
            "Apply to own and operate a player-run business within The District. We are looking for owners who will create consistent roleplay, manage staff properly and keep their business active instead of treating ownership as a passive perk.",

        questions: [
            { key: "age", label: "How old are you?", type: "number", required: true },
            { key: "businessName", label: "What would you like your business to be called? If you are applying to take over an existing business, include its current name.", type: "textarea", required: true },
            { key: "businessType", label: "What type of business are you applying to own, and what services or products would it provide to the city?", type: "textarea", required: true },
            { key: "businessConcept", label: "Explain your full business concept. Include the identity of the business, the type of roleplay you want it to create, how customers would interact with it and what would make it worth visiting.", type: "textarea", required: true },
            { key: "locationPlan", label: "Where would you like the business to operate from? If you have a specific existing location in mind, explain why it suits the business. If not, describe the type of location you would need.", type: "textarea", required: true },
            { key: "ownershipExperience", label: "Tell us about any previous FiveM business ownership, management or leadership experience you have. If you have none, explain what experience you do have that would help you run a team.", type: "textarea", required: true },
            { key: "staffingPlan", label: "How would you recruit, train and manage employees? Include the roles or rank structure you would use and how you would deal with inactive or poorly performing staff.", type: "textarea", required: true },
            { key: "roleplayPlan", label: "How will your business actively create roleplay for people outside your own staff team? Give examples of events, services, partnerships, advertising or scenarios you would create.", type: "textarea", required: true },
            { key: "economyPlan", label: "How would you keep your prices, wages and business activity balanced within the server economy rather than focusing only on making as much money as possible?", type: "textarea", required: true },
            { key: "managementCommitment", label: "How active can you realistically be each week, and how will you make sure the business continues operating when you are not in the city?", type: "textarea", required: true },
            { key: "conflictScenario", label: "Two senior employees have a serious disagreement and it is beginning to affect customers and the rest of the team. Explain how you would handle the situation as the owner.", type: "textarea", required: true },
            { key: "inactivityPlan", label: "If your own activity dropped for an extended period or you could no longer run the business properly, what would you do to protect the business and the roleplay around it?", type: "textarea", required: true },
            { key: "whyYou", label: "Why should The District trust you with business ownership, and what would you bring to the city that another applicant may not?", type: "textarea", required: true }
        ]
    };
}

if (!APPLICATION_MINIMUM_LENGTHS["Business Ownership Application"]) {
    APPLICATION_MINIMUM_LENGTHS["Business Ownership Application"] = {
        businessName: 30,
        businessType: 120,
        businessConcept: 300,
        locationPlan: 120,
        ownershipExperience: 160,
        staffingPlan: 220,
        roleplayPlan: 250,
        economyPlan: 180,
        managementCommitment: 140,
        conflictScenario: 220,
        inactivityPlan: 160,
        whyYou: 220
    };
}

/* Questions created in Application Management can carry their own
   minimumLength value. Preserve the old per-application map as fallback. */
try {
    getQuestionMinimumLength = function (question) {
        if (!question || question.type === "number") return 0;
        return Number(
            question.minimumLength ||
            APPLICATION_MINIMUM_LENGTHS[currentApplicationType]?.[question.key] ||
            0
        );
    };
} catch (error) {
    console.warn("Managed application minimum-length compatibility could not be installed:", error);
}
