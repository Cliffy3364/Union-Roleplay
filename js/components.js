/* The District — community hub navigation */
(function () {
    function navbarPath() {
        return window.location.pathname.includes("/pages/")
            ? "../components/navbar.html"
            : "components/navbar.html";
    }

    function setActiveLink() {
        const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
        document.querySelectorAll("#navbar .hub-nav-link").forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "") || "/";
            const home = (path === "/" || path === "/index.html") && (linkPath === "/" || linkPath === "/index.html");
            link.classList.toggle("active", home || linkPath === path);
        });
    }

    function setupMobileNav() {
        const toggle = document.getElementById("hubNavToggle");
        const links = document.getElementById("hubNavLinks");
        if (!toggle || !links) return;

        toggle.addEventListener("click", () => {
            const open = document.body.classList.toggle("hub-menu-open");
            toggle.setAttribute("aria-expanded", String(open));
        });

        links.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                document.body.classList.remove("hub-menu-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function setupNavScroll() {
        const navbar = document.getElementById("navbar");
        if (!navbar) return;
        const update = () => navbar.classList.toggle("hub-nav-scrolled", window.scrollY > 18);
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    async function loadNavbar() {
        const mount = document.getElementById("navbar");
        if (!mount) return;

        try {
            const response = await fetch(navbarPath(), { cache: "no-store" });
            if (!response.ok) throw new Error("Navigation could not be loaded.");
            mount.innerHTML = await response.text();
            setActiveLink();
            setupMobileNav();
            setupNavScroll();
        } catch (error) {
            console.error("Navigation error:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", loadNavbar);
})();