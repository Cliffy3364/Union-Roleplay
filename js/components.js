/* The District — members-only navigation */
(function () {
    function navbarPath() {
        return window.location.pathname.includes("/pages/") ? "../components/navbar.html" : "components/navbar.html";
    }

    function setActiveLink() {
        const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
        document.querySelectorAll("#navbar .hub-nav-link").forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "") || "/";
            link.classList.toggle("active", linkPath === path);
        });
    }

    function avatarUrl(user) {
        if (!user?.discord_id || !user?.avatar) return "";
        return `https://cdn.discordapp.com/avatars/${encodeURIComponent(user.discord_id)}/${encodeURIComponent(user.avatar)}.png?size=96`;
    }

    async function hydrateMember() {
        let user = window.__DISTRICT_USER || null;
        if (!user && window.DistrictAuth) user = await DistrictAuth.getCurrentUser();
        if (!user) return;

        const name = user.discord_display_name || user.discord_username || user.username || "District Member";
        const nameEl = document.getElementById("hubMemberName");
        const avatarEl = document.getElementById("hubMemberAvatar");

        if (nameEl) nameEl.textContent = name;
        if (avatarEl) {
            const url = avatarUrl(user);
            if (url) avatarEl.innerHTML = `<img src="${url}" alt="">`;
            else avatarEl.textContent = name.charAt(0).toUpperCase();
        }
    }

    function setupMobileNav() {
        const toggle = document.getElementById("hubNavToggle");
        const links = document.getElementById("hubNavLinks");
        if (!toggle || !links) return;
        toggle.addEventListener("click", () => {
            const open = document.body.classList.toggle("hub-menu-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
        links.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
            document.body.classList.remove("hub-menu-open");
            toggle.setAttribute("aria-expanded", "false");
        }));
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
            await hydrateMember();

            const logout = document.getElementById("hubLogoutButton");
            if (logout && window.DistrictAuth) logout.addEventListener("click", DistrictAuth.logout);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", loadNavbar);
})();