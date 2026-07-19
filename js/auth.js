class Auth {

    static isLoggedIn() {
        return localStorage.getItem("union_logged_in") === "true";
    }

    static logout() {
        localStorage.removeItem("union_logged_in");
        window.location.replace("login.html");
    }

    static requireLogin() {

        if (!this.isLoggedIn()) {

            window.location.replace("login.html");

        }

    }

}