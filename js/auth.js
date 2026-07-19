class Auth {
    static STORAGE_KEY = "union_user";
    static TOKEN_KEY = "union_access_token";

    static getUser() {
        try {
            const value = localStorage.getItem(this.STORAGE_KEY);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    }

    static saveUser(user) {
        if (!user || typeof user !== "object" || !user.id) {
            throw new Error("A valid authenticated Discord user is required.");
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem("union_logged_in", "true");
    }

    static saveSession(user, token = "") {
        this.saveUser(user);
        if (token) sessionStorage.setItem(this.TOKEN_KEY, token);
    }

    static isLoggedIn() { return this.getUser() !== null; }
    static getRoles() { return this.getUser()?.roles || []; }
    static hasRole(roleId) { return Boolean(roleId) && this.getRoles().includes(String(roleId)); }
    static hasAnyRole(roleIds = []) { return roleIds.some(role => this.hasRole(role)); }
    static isStaff() { return this.hasAnyRole(window.UNION_CONFIG?.STAFF_ROLES || []); }

    static logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem("union_logged_in");
        sessionStorage.removeItem(this.TOKEN_KEY);
        window.location.replace("login.html");
    }

    static requireLogin() {
        if (!this.isLoggedIn()) {
            const returnTo = encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
            window.location.replace(`login.html?returnTo=${returnTo}`);
            return false;
        }
        return true;
    }

    static requireStaff() {
        if (!this.requireLogin()) return false;
        return this.isStaff();
    }

    static escape(value = "") {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        })[character]);
    }

    static updateNavigation(scope = document) {
        const accountArea = scope.getElementById?.("accountArea") || document.getElementById("accountArea");
        const staffNav = scope.getElementById?.("staffNav") || document.getElementById("staffNav");
        if (!accountArea) return;

        const user = this.getUser();
        if (!user) {
            accountArea.innerHTML = '<a href="login.html" class="profile-button">Login</a>';
            if (staffNav) staffNav.hidden = true;
            return;
        }

        const displayName = this.escape(user.global_name || user.displayName || user.username || "Profile");
        accountArea.innerHTML = `<a href="profile.html" class="profile-button">${displayName}</a>`;
        if (staffNav) staffNav.hidden = !this.isStaff();
    }
}

window.Auth = Auth;
document.addEventListener("DOMContentLoaded", () => Auth.updateNavigation());
window.addEventListener("union:navbar-ready", () => Auth.updateNavigation());
