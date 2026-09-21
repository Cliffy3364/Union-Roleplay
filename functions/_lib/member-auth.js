const AUTH_API = "https://the-district-api.danielclifford2808.workers.dev";

export function readCookie(header, name) {
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

export function getSessionToken(request) {
    const auth = request.headers.get("Authorization") || "";
    if (auth.toLowerCase().startsWith("bearer ")) {
        return auth.slice(7).trim();
    }
    return readCookie(request.headers.get("Cookie"), "district_session");
}

export async function requireDistrictUser(request) {
    const token = getSessionToken(request);
    if (!token) return { ok: false, status: 401, error: "Not signed in." };

    try {
        const response = await fetch(`${AUTH_API}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            cf: { cacheTtl: 0, cacheEverything: false }
        });

        const data = await response.json();
        if (!response.ok || !data?.success || !data?.user) {
            return { ok: false, status: 401, error: "Session expired." };
        }

        return { ok: true, user: data.user, is_staff: data.is_staff === true };
    } catch {
        return { ok: false, status: 503, error: "Authentication service unavailable." };
    }
}

export function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}