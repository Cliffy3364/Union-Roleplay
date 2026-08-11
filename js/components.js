const COMPONENTS_API =
    "https://union-roleplay-api.danielclifford2808.workers.dev";


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


        await setupNavbarUser();


    } catch (error) {

        console.error(
            "Navbar error:",
            error
        );
    }
}


async function setupNavbarUser() {

    const loginButton =
        document.getElementById(
            "discordLogin"
        );

    const staffLink =
        document.getElementById(
            "staffPanelNav"
        );


    if (staffLink) {
        staffLink.hidden = true;
    }


    if (!window.UnionAuth) {

        setupLoginButton(
            loginButton
        );

        return;
    }


    try {

        const user =
            await UnionAuth.getCurrentUser();


        /*
         * NOT LOGGED IN
         */

        if (!user) {

            setupLoginButton(
                loginButton
            );

            return;
        }


        /*
         * LOGGED IN
         */

        if (loginButton) {

            loginButton.textContent =
                user.discord_display_name ||
                user.discord_username ||
                user.username ||
                "Account";

            loginButton.href =
                getPagePath(
                    "dashboard.html"
                );
        }


        /*
         * STAFF PANEL
         */

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


function getPagePath(
    page
) {

    if (
        window.location.pathname.includes(
            "/pages/"
        )
    ) {

        return page;
    }

    return `pages/${page}`;
}


document.addEventListener(
    "DOMContentLoaded",
    loadNavbar
);