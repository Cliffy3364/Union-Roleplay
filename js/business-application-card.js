/* ==========================================================
   THE DISTRICT — APPLICATION SYSTEM BOOTSTRAP V9
========================================================== */
(function () {
    function loadScript(src, dataName) {
        if (document.querySelector(`script[${dataName}]`)) return;
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.setAttribute(dataName, "true");
        document.head.appendChild(script);
    }

    function loadStyle(href, dataName) {
        if (document.querySelector(`link[${dataName}]`)) return;
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = href;
        style.setAttribute(dataName, "true");
        document.head.appendChild(style);
    }

    function bootstrap() {
        if (document.querySelector(".applications-page")) {
            loadScript("/js/applications-managed-v8.js", "data-applications-managed-v8");
        }

        if (document.querySelector(".staff-shell")) {
            loadStyle("/css/staff-applications-manager-v8.css", "data-staff-applications-manager-v8");
            loadScript("/js/staff-applications-manager-v9.js", "data-staff-applications-manager-v9");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
    } else {
        bootstrap();
    }
})();
