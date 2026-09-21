const API_URL = "https://the-district-api.danielclifford2808.workers.dev";

async function getCurrentUser() {
    const token = localStorage.getItem("district_session");
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });
        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
            localStorage.removeItem("district_session");
            return null;
        }

        const user = data.user;
        user.is_staff = data.is_staff === true;
        return user;
    } catch (error) {
        console.error("Failed to load current user:", error);
        return null;
    }
}

function getToken() {
    return localStorage.getItem("district_session") || "";
}

function login() {
    window.location.href = `${API_URL}/api/auth/discord`;
}

function persistSessionCookie(token) {
    if (!token) return;
    document.cookie = `district_session=${encodeURIComponent(token)}; Path=/; Max-Age=604800; Secure; SameSite=Lax`;
}

function clearSessionCookie() {
    document.cookie = "district_session=; Path=/; Max-Age=0; Secure; SameSite=Lax";
}

function logout() {
    localStorage.removeItem("district_session");
    sessionStorage.removeItem("district_return_path");
    clearSessionCookie();
    window.location.href = "/index.html";
}

window.DistrictAuth = { API_URL, getCurrentUser, getToken, login, logout, persistSessionCookie, clearSessionCookie };