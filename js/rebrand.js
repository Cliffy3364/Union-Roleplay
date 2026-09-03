/* Global presentation layer for the 2026 District rebrand. */
(function () {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    function setupNavbarScroll() {
        const nav = document.getElementById("navbar");
        if (!nav) return;
        const sync = () => nav.classList.toggle("navbar-scrolled", window.scrollY > 18);
        sync();
        window.addEventListener("scroll", sync, { passive: true });
    }

    function setupReveals() {
        if (reduceMotion || !("IntersectionObserver" in window)) return;
        const targets = document.querySelectorAll(
            ".district-section-head, .district-feature-card, .district-experience-panel, .district-event-card, .district-join-card"
        );
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("district-revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        targets.forEach((target) => {
            target.classList.add("district-reveal");
            observer.observe(target);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupNavbarScroll();
        setupReveals();
    });
})();
