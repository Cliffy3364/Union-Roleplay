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


    if (!window.UnionAuth) {

        setupLoginButton(
            loginButton
        );

        return;
    }


    try {

        const user =
            await UnionAuth.getCurrentUser();


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
                    UnionAuth.logout();
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