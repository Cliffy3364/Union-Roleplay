const COMPONENTS_API =
    "https://the-district-api.danielclifford2808.workers.dev";


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
                user.discord_display_name ||
                user.discord_username ||
                user.username ||
                "Account";

            /*
                CLOUDFLARE PAGES:
                Site now runs from the domain root.
            */

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
        "Login with Discord";

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
