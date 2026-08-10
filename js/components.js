async function loadNavbar() {
    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    let path = "components/navbar.html";

    if (window.location.pathname.includes("/pages/")) {
        path = "../components/navbar.html";
    }

    const response = await fetch(path);

    navbar.innerHTML = await response.text();
}

document.addEventListener("DOMContentLoaded", loadNavbar);