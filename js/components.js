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


        setupDiscordLogin();

        await setupStaffNavigation();


    } catch (error) {

        console.error(
            "Navbar error:",
            error
        );
    }
}


function setupDiscordLogin() {

    const loginButton =
        document.getElementById(
            "discordLogin"
        );

    if (!loginButton) return;


    loginButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            window.location.href =
                `${COMPONENTS_API}/api/auth/discord`;
        }
    );
}


async function setupStaffNavigation() {

    const staffLink =
        document.getElementById(
            "staffPanelNav"
        );

    if (!staffLink) return;


    /*
     * Hide it by default.
     * This prevents normal members seeing
     * the Staff Panel link while authentication
     * is being checked.
     */

    staffLink.hidden = true;


    if (!window.UnionAuth) {
        return;
    }


    try {

        const user =
            await UnionAuth.getCurrentUser();


        if (
            user &&
            user.is_staff === true
        ) {

            staffLink.hidden = false;
        }


    } catch (error) {

        console.error(
            "Staff navigation check failed:",
            error
        );

        staffLink.hidden = true;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadNavbar
);