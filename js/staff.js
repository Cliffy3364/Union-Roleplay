document.addEventListener("DOMContentLoaded", async () => {

    const loading = document.getElementById("staffLoading");
    const denied = document.getElementById("staffDenied");
    const panel = document.getElementById("staffPanel");

    if (!window.UnionAuth) {
        if (loading) loading.hidden = true;
        if (denied) denied.hidden = false;
        return;
    }

    const user = await UnionAuth.getCurrentUser();

    if (loading) {
        loading.hidden = true;
    }

    if (!user || user.is_staff !== true) {
        if (denied) {
            denied.hidden = false;
        }

        return;
    }

    if (panel) {
        panel.hidden = false;
    }

});