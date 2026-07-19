class Auth {

    static STORAGE_KEY = "union_user";

    static getUser() {

        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        } catch {
            return null;
        }

    }

    static saveUser(user) {

        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(user)
        );

    }

    static isLoggedIn() {

        return this.getUser() !== null;

    }

    static getRoles() {

        const user = this.getUser();

        return user?.roles || [];

    }

    static hasRole(roleId) {

        return this.getRoles().includes(roleId);

    }

    static logout() {

        localStorage.removeItem(this.STORAGE_KEY);

        window.location.href = "login.html";

    }

    static requireLogin() {

        if (!this.isLoggedIn()) {

            window.location.href = "login.html";

        }

    }

    static updateNavigation() {

        const accountArea = document.getElementById("accountArea");
        const staffNav = document.getElementById("staffNav");

        if (!accountArea) return;

        if (!this.isLoggedIn()) {

            accountArea.innerHTML = `
                <a href="login.html" class="profile-button">
                    Login
                </a>
            `;

            if (staffNav) {
                staffNav.hidden = true;
            }

            return;

        }

        const user = this.getUser();

        accountArea.innerHTML = `
            <a href="profile.html" class="profile-button">
                ${user.username}
            </a>
        `;

        if (!staffNav) return;

        const staffRoles = [

            UNION_CONFIG.DISCORD.ROLES.FOUNDER,
            UNION_CONFIG.DISCORD.ROLES.MANAGEMENT,
            UNION_CONFIG.DISCORD.ROLES.STAFF,
            UNION_CONFIG.DISCORD.ROLES.TRIAL_STAFF,
            UNION_CONFIG.DISCORD.ROLES.SENIOR_DEVELOPER,
            UNION_CONFIG.DISCORD.ROLES.DEVELOPER,
            UNION_CONFIG.DISCORD.ROLES.TRAINEE_DEVELOPER

        ];

        staffNav.hidden = !staffRoles.some(role => this.hasRole(role));

    }

}

document.addEventListener("DOMContentLoaded", () => {

    Auth.updateNavigation();

});