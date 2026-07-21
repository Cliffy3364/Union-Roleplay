class Permissions {
    static getRoles() {
        if (window.Auth && typeof Auth.getRoles === "function") {
            return Auth.getRoles().map(String);
        }

        try {
            const user = JSON.parse(localStorage.getItem("union_user") || "null");
            return Array.isArray(user?.roles) ? user.roles.map(String) : [];
        } catch {
            return [];
        }
    }

    static hasRole(roleId) {
        return Boolean(roleId) && this.getRoles().includes(String(roleId));
    }

    static isFounder() {
        return this.hasRole(window.UNION_CONFIG?.DISCORD?.ROLES?.FOUNDER);
    }

    static isManagement() {
        return this.hasRole(window.UNION_CONFIG?.DISCORD?.ROLES?.MANAGEMENT);
    }

    static isStaff() {
        const staffRoles = window.UNION_CONFIG?.STAFF_ROLES || [];
        return staffRoles.some(roleId => this.hasRole(roleId));
    }
}

window.Permissions = Permissions;
