const COMPONENTS_API =
    "https://the-district-api.danielclifford2808.workers.dev";

/* ==========================================================
   DISTRICT GLOBAL ASSETS
   Loaded here because components.js is included across the site.
========================================================== */
(function loadDistrictVisualAssets() {
    if (!document.querySelector('link[href$="district-v2.css"]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/css/district-v2.css";
        style.dataset.districtV2 = "true";
        document.head.appendChild(style);
    }

    if (!document.querySelector('link[href$="district-v2-compat.css"]')) {
        const compat = document.createElement("link");
        compat.rel = "stylesheet";
        compat.href = "/css/district-v2-compat.css";
        compat.dataset.districtV2Compat = "true";
        document.head.appendChild(compat);
    }

    if (!document.querySelector('script[data-district-v2]')) {
        const script = document.createElement("script");
        script.src = "/js/district-v2.js";
        script.dataset.districtV2 = "true";
        script.defer = true;
        document.head.appendChild(script);
    }

    if (!document.querySelector('link[href$="district-v3.css"]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/css/district-v3.css";
        style.dataset.districtV3 = "true";
        document.head.appendChild(style);
    }

    if (!document.querySelector('script[data-district-v3]')) {
        const script = document.createElement("script");
        script.src = "/js/district-v3.js";
        script.dataset.districtV3 = "true";
        script.defer = true;
        document.head.appendChild(script);
    }

    if (!document.querySelector('link[href$="district-v4.css"]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/css/district-v4.css";
        style.dataset.districtV4 = "true";
        document.head.appendChild(style);
    }

    if (!document.querySelector('link[href$="district-v4-assets.css"]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/css/district-v4-assets.css";
        style.dataset.districtV4Assets = "true";
        document.head.appendChild(style);
    }

    if (!document.querySelector('link[href$="district-v4-pages.css"]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/css/district-v4-pages.css";
        style.dataset.districtV4Pages = "true";
        document.head.appendChild(style);
    }

    if (document.body?.classList.contains("wiki-v2")) {
        if (!document.querySelector('link[href$="wiki-simple-v5.css"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = "/css/wiki-simple-v5.css";
            style.dataset.wikiSimpleV5 = "true";
            document.head.appendChild(style);
        }

        if (!document.querySelector('script[data-wiki-simple-v5]')) {
            const script = document.createElement("script");
            script.src = "/js/wiki-simple-v5.js";
            script.dataset.wikiSimpleV5 = "true";
            script.defer = true;
            document.head.appendChild(script);
        }

        if (!document.querySelector('script[data-wiki-public-v6]')) {
            const script = document.createElement("script");
            script.src = "/js/wiki-public-v6.js";
            script.dataset.wikiPublicV6 = "true";
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    if (document.body?.classList.contains("rules-page-shell")) {
        if (!document.querySelector('link[href$="rules-simple-v5.css"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = "/css/rules-simple-v5.css";
            style.dataset.rulesSimpleV5 = "true";
            document.head.appendChild(style);
        }

        if (!document.querySelector('script[data-rules-simple-v5]')) {
            const script = document.createElement("script");
            script.src = "/js/rules-simple-v5.js";
            script.dataset.rulesSimpleV5 = "true";
            script.defer = true;
            document.head.appendChild(script);
        }

        if (!document.querySelector('link[href$="rules-v6.css"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = "/css/rules-v6.css";
            style.dataset.rulesV6 = "true";
            document.head.appendChild(style);
        }

        if (!document.querySelector('link[href$="rules-readable-v7.css"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = "/css/rules-readable-v7.css";
            style.dataset.rulesReadableV7 = "true";
            document.head.appendChild(style);
        }

        if (!document.querySelector('script[data-rules-readable-v7]')) {
            const script = document.createElement("script");
            script.src = "/js/rules-readable-v7.js";
            script.dataset.rulesReadableV7 = "true";
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    if (document.querySelector(".staff-shell")) {
        if (!document.querySelector('link[href$="staff-content-v6.css"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = "/css/staff-content-v6.css";
            style.dataset.staffContentV6 = "true";
            document.head.appendChild(style);
        }

        if (!document.querySelector('link[href$="staff-stability-v7.css"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = "/css/staff-stability-v7.css";
            style.dataset.staffStabilityV7 = "true";
            document.head.appendChild(style);
        }

        /* V6 JS was intentionally retired because its mutation observer could
           repeatedly rewrite the Staff DOM and lock up the page. */
        if (!document.querySelector('script[data-staff-content-v7]')) {
            const script = document.createElement("script");
            script.src = "/js/staff-content-v7.js";
            script.dataset.staffContentV7 = "true";
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    if (!document.querySelector('link[href$="changelog-multiarea.css"]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/css/changelog-multiarea.css";
        style.dataset.changelogMultiarea = "true";
        document.head.appendChild(style);
    }

    if (!document.querySelector('script[data-changelog-multiarea]')) {
        const script = document.createElement("script");
        script.src = "/js/changelog-multiarea.js";
        script.dataset.changelogMultiarea = "true";
        script.defer = true;
        document.head.appendChild(script);
    }

    if (!document.querySelector('script[data-changelog-cleanup]')) {
        const script = document.createElement("script");
        script.src = "/js/changelog-cleanup.js";
        script.dataset.changelogCleanup = "true";
        script.defer = true;
        document.head.appendChild(script);
    }

    if (!document.querySelector('script[data-business-application-card]')) {
        const script = document.createElement("script");
        script.src = "/js/business-application-card.js";
        script.dataset.businessApplicationCard = "true";
        script.defer = true;
        document.head.appendChild(script);
    }
})();


async function loadNavbar() {

    const navbar =
        document.getElementById("navbar");

    if (!navbar) return;


    let path =
        "components/navbar.html";

    if (
        window.location.pathname.includes(
            "/pages/"
        )
    ) {
        path =
            "../components/navbar.html";
    }


    try {

        const response =
            await fetch(path);

        if (!response.ok) {
            throw new Error(
                "Navbar could not be loaded."
            );
        }

        navbar.innerHTML =
            await response.text();

        setActiveNavbarLink();

        await setupNavbarUser();

        setupMobileNavbar();

    } catch (error) {

        console.error(
            "Navbar error:",
            error
        );
    }
}


function setActiveNavbarLink() {

    const currentPath =
        window.location.pathname
            .replace(/\/+$/, "") ||
        "/index.html";

    document
        .querySelectorAll(
            "#navbar .navbar-link"
        )
        .forEach(link => {

            const linkPath =
                new URL(
                    link.href,
                    window.location.origin
                ).pathname
                    .replace(/\/+$/, "");

            const homeMatch =
                (
                    currentPath === "" ||
                    currentPath === "/" ||
                    currentPath === "/index.html"
                ) &&
                (
                    linkPath === "/" ||
                    linkPath === "/index.html"
                );

            link.classList.toggle(
                "active",
                homeMatch ||
                linkPath === currentPath
            );
        });
}


async function setupNavbarUser() {

    const loginButton =
        document.getElementById(
            "discordLogin"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const staffLink =
        document.getElementById(
            "staffPanelNav"
        );


    if (staffLink) {
        staffLink.hidden = true;
    }

    if (logoutButton) {
        logoutButton.hidden = true;
    }


    if (!window.DistrictAuth) {

        setupLoginButton(
            loginButton
        );

        return;
    }


    try {

        const user =
            await DistrictAuth.getCurrentUser();


        if (!user) {

            setupLoginButton(
                loginButton
            );

            return;
        }


        if (loginButton) {

            loginButton.textContent =
                "My District";

            loginButton.title =
                user.discord_display_name ||
                user.discord_username ||
                user.username ||
                "District account";

            loginButton.href =
                "/pages/dashboard.html";
        }


        if (logoutButton) {

            logoutButton.hidden = false;

            logoutButton.addEventListener(
                "click",
                () => {
                    DistrictAuth.logout();
                }
            );
        }


        if (
            staffLink &&
            user.is_staff === true
        ) {

            staffLink.hidden = false;
        }


    } catch (error) {

        console.error(
            "Navbar user check failed:",
            error
        );

        setupLoginButton(
            loginButton
        );
    }
}


function setupLoginButton(
    loginButton
) {

    if (!loginButton) {
        return;
    }


    loginButton.textContent =
        "Sign In";

    loginButton.href =
        `${COMPONENTS_API}/api/auth/discord`;
}


document.addEventListener(
    "DOMContentLoaded",
    loadNavbar
);

/* MOBILE NAVIGATION */
function setupMobileNavbar() {
    const navbar = document.querySelector("#navbar .navbar-inner");
    const links = document.querySelector("#navbar .navbar-links");
    if (!navbar || !links) return;

    let toggle = document.getElementById("navbarMobileToggle");
    if (!toggle) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.id = "navbarMobileToggle";
        toggle.className = "navbar-mobile-toggle";
        toggle.setAttribute("aria-label", "Open navigation");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
        const actions = navbar.querySelector(".navbar-actions");
        actions ? navbar.insertBefore(toggle, actions) : navbar.appendChild(toggle);
    }

    const closeMenu = () => {
        links.classList.remove("mobile-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
    };

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = links.classList.toggle("mobile-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = open ? "×" : "☰";
    });

    links.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("click", event => {
        if (window.innerWidth <= 900 && !navbar.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) closeMenu();
    });
}
