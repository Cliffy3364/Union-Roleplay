class Permissions {

    static getRoles() {
        return JSON.parse(localStorage.getItem("union_roles") || "[]");
    }

    static hasRole(role) {
        return this.getRoles().includes(role);
    }

    static isFounder() {
        return this.hasRole("Founder");
    }

    static isManagement() {
        return this.hasRole("Management");
    }

    static isStaff() {
        return (
            this.isFounder() ||
            this.isManagement() ||
            this.hasRole("Staff") ||
            this.hasRole("Trial Staff")
        );
    }

}