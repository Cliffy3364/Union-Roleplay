/* ==========================================================
   THE DISTRICT — MANAGED APPLICATION REVIEW LABELS
   Keeps the Staff review page in sync with Application Management.
========================================================== */

/* Immediate fallback for Business Ownership on older deployments. */
REVIEW_QUESTION_CONFIG["Business Ownership Application"] = REVIEW_QUESTION_CONFIG["Business Ownership Application"] || {
    age: "How old are you?",
    businessName: "What would you like your business to be called?",
    businessType: "What type of business are you applying to own, and what would it provide?",
    businessConcept: "Explain your full business concept and the roleplay it would create.",
    locationPlan: "Where would the business operate and why?",
    ownershipExperience: "Tell us about your previous business ownership, management or leadership experience.",
    staffingPlan: "How would you recruit, train and manage employees?",
    roleplayPlan: "How will the business create roleplay for people outside the staff team?",
    economyPlan: "How would you keep prices, wages and business activity balanced within the economy?",
    managementCommitment: "How active can you realistically be, and how will the business operate when you are unavailable?",
    conflictScenario: "How would you handle serious conflict between senior employees?",
    inactivityPlan: "What would you do if you could no longer run the business properly?",
    whyYou: "Why should The District trust you with business ownership?"
};

(async function loadManagedApplicationReviewLabels() {
    try {
        const response = await fetch("/api/application-catalog", {
            headers: { Accept: "application/json" },
            cache: "no-store"
        });
        const data = await response.json();
        if (!response.ok || data?.success !== true || !Array.isArray(data.applications)) return;

        data.applications.forEach(application => {
            const labels = {};
            (application.questions || []).forEach(question => {
                if (question?.key && question?.label) labels[question.key] = question.label;
            });
            if (Object.keys(labels).length) {
                REVIEW_QUESTION_CONFIG[application.application_type] = labels;
            }
        });

        /* If the review already rendered while the catalog was loading,
           redraw only the answers using the now-current question wording. */
        if (typeof currentApplication !== "undefined" && currentApplication && typeof renderAnswers === "function") {
            renderAnswers(currentApplication);
        }
    } catch (error) {
        console.warn("Managed review labels unavailable:", error);
    }
})();
