const API_URL = "https://union-roleplay-api.danielclifford2808.workers.dev";

async function getCurrentUser() {
    const token = localStorage.getItem("union_session");

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
            localStorage.removeItem("union_session");
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

window.UnionAuth = {
    getCurrentUser
};