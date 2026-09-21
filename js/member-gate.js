/* The District — members-only route guard */
(async function protectDistrictMemberPage() {
    const root = document.documentElement;
    const current = window.location.pathname + window.location.search + window.location.hash;

    if (!window.DistrictAuth) {
        sessionStorage.setItem("district_return_path", current);
        window.location.replace("/index.html");
        return;
    }

    const user = await DistrictAuth.getCurrentUser();

    if (!user) {
        sessionStorage.setItem("district_return_path", current);
        window.location.replace("/index.html");
        return;
    }

    window.__DISTRICT_USER = user;
    root.classList.add("member-ready");
    document.dispatchEvent(new CustomEvent("district:member-ready", { detail: user }));
})();