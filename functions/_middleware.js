const AUTH_API = "https://the-district-api.danielclifford2808.workers.dev";

function readCookie(header, name) {
    const source = String(header || "");
    for (const pair of source.split(";")) {
        const index = pair.indexOf("=");
        if (index === -1) continue;
        const key = pair.slice(0, index).trim();
        if (key !== name) continue;
        return decodeURIComponent(pair.slice(index + 1).trim());
    }
    return "";
}

function redirectToLogin(request, clearCookie = false) {
    const login = new URL("/index.html", request.url);
    const headers = new Headers({ Location: login.toString() });
    if (clearCookie) {
        headers.set("Set-Cookie", "district_session=; Path=/; Max-Age=0; Secure; SameSite=Lax");
    }
    return new Response(null, { status: 302, headers });
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const protectedPath =
        url.pathname === "/rules.html" ||
        url.pathname.startsWith("/pages/");

    if (!protectedPath) {
        return context.next();
    }

    const token = readCookie(context.request.headers.get("Cookie"), "district_session");
    if (!token) return redirectToLogin(context.request);

    try {
        const response = await fetch(`${AUTH_API}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            cf: { cacheTtl: 0, cacheEverything: false }
        });

        if (!response.ok) return redirectToLogin(context.request, true);
        const data = await response.json();
        if (!data?.success || !data?.user) return redirectToLogin(context.request, true);

        return context.next();
    } catch {
        return redirectToLogin(context.request);
    }
}
