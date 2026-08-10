async function loadNavbar() {
    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    let path = "components/navbar.html";

    if (window.location.pathname.includes("/pages/")) {
        path = "../components/navbar.html";
    }

    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error("Navbar could not be loaded.");
        }

        navbar.innerHTML = await response.text();

        setupDiscordLogin();

    } catch (error) {
        console.error("Navbar error:", error);
    }
}


function setupDiscordLogin() {

    const loginButton = document.getElementById("discordLogin");

    if (!loginButton) return;

    loginButton.addEventListener("click", function(event) {

        event.preventDefault();

        window.location.href =
            "https://union-roleplay-api.danielclifford2808.workers.dev/api/auth/discord";

    });

}


document.addEventListener("DOMContentLoaded", loadNavbar);