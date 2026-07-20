const ALLOWED_ORIGIN = "https://cliffy3364.github.io";
const WEBSITE_URL =
    "https://cliffy3364.github.io/Union-Roleplay";
const SESSION_LENGTH_MS =
    7 * 24 * 60 * 60 * 1000;

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods":
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin"
    };
}

function json(data, status = 200, extraHeaders = {}) {
    return Response.json(data, {
        status,
        headers: {
            ...corsHeaders(),
            "Content-Type": "application/json",
            ...extraHeaders
        }
    });
}

function getCookie(request, name) {
    const cookieHeader =
        request.headers.get("Cookie") || "";

    const cookies = cookieHeader
        .split(";")
        .map(cookie => cookie.trim());

    for (const cookie of cookies) {
        const [key, ...valueParts] = cookie.split("=");

        if (key === name) {
            return decodeURIComponent(
                valueParts.join("=")
            );
        }
    }

    return null;
}

function getBearerToken(request) {
    const authorization =
        request.headers.get("Authorization") || "";

    if (!authorization.startsWith("Bearer ")) {
        return null;
    }

    return authorization.slice(7).trim();
}

function parseRoles(roles) {
    if (Array.isArray(roles)) {
        return roles;
    }

    try {
        const parsed = JSON.parse(roles || "[]");

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function formatUser(user) {
    if (!user) {
        return null;
    }

    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=256`
        : "https://cdn.discordapp.com/embed/avatars/0.png";

    const discordUsername =
        user.discord_username || user.username || "Unknown User";

    const discordDisplayName =
        user.discord_display_name || discordUsername;

    return {
        id: user.id,
        union_id: user.union_id || null,
        unionId: user.union_id || null,
        discord_id: user.discord_id,
        discordId: user.discord_id,
        username: discordUsername,
        discord_username: discordUsername,
        discordUsername,
        display_name: discordDisplayName,
        displayName: discordDisplayName,
        discord_display_name: discordDisplayName,
        discordDisplayName,
        avatar: user.avatar || "",
        avatar_url: avatarUrl,
        avatarUrl,
        roles: parseRoles(user.roles),
        created_at: user.created_at
    };
}

function generateToken() {
    return [
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID()
    ].join("-");
}

async function readJsonBody(request) {
    try {
        return await request.json();
    } catch {
        return null;
    }
}

async function getAuthenticatedUser(request, env) {
    const token = getBearerToken(request);

    if (!token) {
        return null;
    }

    const now = Date.now();

    const session = await env.DB.prepare(`
        SELECT
            s.token,
            s.discord_id,
            s.expires_at,
            u.id,
            u.union_id,
            u.username,
            u.discord_username,
            u.discord_display_name,
            u.avatar,
            u.roles,
            u.created_at
        FROM sessions AS s
        INNER JOIN users AS u
            ON u.discord_id = s.discord_id
        WHERE s.token = ?
          AND s.expires_at > ?
        LIMIT 1
    `)
        .bind(token, now)
        .first();

    if (!session) {
        return null;
    }

    return {
        token,
        user: formatUser(session)
    };
}


function parseCsv(value) {
    return String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}

async function getDiscordGuildRoles(discordId, env) {
    if (!discordId || !env.DISCORD_BOT_TOKEN || !env.DISCORD_GUILD_ID) {
        return [];
    }

    try {
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`,
            {
                headers: {
                    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`
                }
            }
        );

        if (!response.ok) return [];
        const member = await response.json();
        return Array.isArray(member.roles) ? member.roles.map(String) : [];
    } catch {
        return [];
    }
}

async function isStaffUser(user, env) {
    if (!user?.discord_id) return false;

    const allowedDiscordIds = parseCsv(env.STAFF_DISCORD_IDS);
    if (allowedDiscordIds.includes(String(user.discord_id))) return true;

    const allowedRoleIds = parseCsv(env.STAFF_ROLE_IDS);
    if (!allowedRoleIds.length) return false;

    const guildRoles = await getDiscordGuildRoles(user.discord_id, env);
    return guildRoles.some(roleId => allowedRoleIds.includes(roleId));
}

async function requireStaff(request, env) {
    const authenticated = await getAuthenticatedUser(request, env);

    if (!authenticated) {
        return {
            error: json({ success: false, error: "Not logged in." }, 401)
        };
    }

    if (!(await isStaffUser(authenticated.user, env))) {
        return {
            error: json({
                success: false,
                error: "You do not have permission to access the staff application system."
            }, 403)
        };
    }

    return authenticated;
}

async function sendDiscordWebhook(url, embed) {
    if (!url) return;
    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.warn("Discord webhook notification failed", error);
    }
}

function applicationEmbed(application, user, title, color) {
    const submittedAt = Number(application?.submitted_at || application?.reviewed_at || Date.now());
    return {
        title,
        color,
        fields: [
            { name: "Union ID", value: String(application?.union_id || user?.union_id || "Unknown"), inline: true },
            { name: "Discord", value: String(user?.displayName || user?.username || application?.discord_id || "Unknown"), inline: true },
            { name: "Status", value: String(application?.status || "Submitted"), inline: true },
            { name: "Application", value: `#${application?.id || "Unknown"}`, inline: true }
        ],
        timestamp: new Date(submittedAt).toISOString(),
        footer: { text: "Union Roleplay Application System" }
    };
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    ...corsHeaders(),
                    "Access-Control-Max-Age": "86400"
                }
            });
        }

        /*
         * API status
         */
        if (
            url.pathname === "/" &&
            request.method === "GET"
        ) {
            return json({
                success: true,
                message: "Union Roleplay API is online"
            });
        }

        /*
         * Start Discord login
         */
        if (
            url.pathname === "/api/auth/discord" &&
            request.method === "GET"
        ) {
            const state = crypto.randomUUID();

            const authorizeUrl = new URL(
                "https://discord.com/oauth2/authorize"
            );

            authorizeUrl.searchParams.set(
                "client_id",
                env.DISCORD_CLIENT_ID
            );

            authorizeUrl.searchParams.set(
                "response_type",
                "code"
            );

            authorizeUrl.searchParams.set(
                "redirect_uri",
                env.DISCORD_REDIRECT_URI
            );

            authorizeUrl.searchParams.set(
                "scope",
                "identify guilds"
            );

            authorizeUrl.searchParams.set(
                "state",
                state
            );

            authorizeUrl.searchParams.set(
                "prompt",
                "consent"
            );

            return new Response(null, {
                status: 302,
                headers: {
                    Location: authorizeUrl.toString(),
                    "Set-Cookie": [
                        `union_oauth_state=${encodeURIComponent(state)}`,
                        "HttpOnly",
                        "Secure",
                        "SameSite=Lax",
                        "Path=/",
                        "Max-Age=600"
                    ].join("; ")
                }
            });
        }

        /*
         * Discord OAuth callback
         */
        if (
            url.pathname ===
                "/api/auth/discord/callback" &&
            request.method === "GET"
        ) {
            const code =
                url.searchParams.get("code");

            const returnedState =
                url.searchParams.get("state");

            const savedState =
                getCookie(
                    request,
                    "union_oauth_state"
                );

            if (!code) {
                return json(
                    {
                        success: false,
                        error:
                            "Missing Discord authorization code."
                    },
                    400
                );
            }

            if (
                !returnedState ||
                !savedState ||
                returnedState !== savedState
            ) {
                return json(
                    {
                        success: false,
                        error:
                            "Invalid or expired OAuth state."
                    },
                    400
                );
            }

            try {
                const tokenResponse = await fetch(
                    "https://discord.com/api/oauth2/token",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },
                        body: new URLSearchParams({
                            client_id:
                                env.DISCORD_CLIENT_ID,
                            client_secret:
                                env.DISCORD_CLIENT_SECRET,
                            grant_type:
                                "authorization_code",
                            code,
                            redirect_uri:
                                env.DISCORD_REDIRECT_URI
                        })
                    }
                );

                const tokenData =
                    await tokenResponse.json();

                if (
                    !tokenResponse.ok ||
                    !tokenData.access_token
                ) {
                    return json(
                        {
                            success: false,
                            error:
                                "Discord token exchange failed.",
                            details: tokenData
                        },
                        400
                    );
                }

                const userResponse = await fetch(
                    "https://discord.com/api/users/@me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${tokenData.access_token}`
                        }
                    }
                );

                const discordUser =
                    await userResponse.json();

                if (
                    !userResponse.ok ||
                    !discordUser.id
                ) {
                    return json(
                        {
                            success: false,
                            error:
                                "Failed to fetch Discord user.",
                            details: discordUser
                        },
                        400
                    );
                }

                const discordUsername =
                    discordUser.username || "Unknown User";

                const discordDisplayName =
                    discordUser.global_name || discordUsername;

                await env.DB.prepare(`
                    INSERT INTO users (
                        discord_id,
                        username,
                        discord_username,
                        discord_display_name,
                        avatar,
                        roles
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(discord_id)
                    DO UPDATE SET
                        username = excluded.username,
                        discord_username = excluded.discord_username,
                        discord_display_name = excluded.discord_display_name,
                        avatar = excluded.avatar
                `)
                    .bind(
                        discordUser.id,
                        discordUsername,
                        discordUsername,
                        discordDisplayName,
                        discordUser.avatar || "",
                        "[]"
                    )
                    .run();

                /*
                 * Assign a permanent Union ID to users who do
                 * not already have one. The database row ID is
                 * used so every value remains unique.
                 */
                await env.DB.prepare(`
                    UPDATE users
                    SET union_id = 'URP-' || printf('%06d', id)
                    WHERE discord_id = ?
                      AND (union_id IS NULL OR TRIM(union_id) = '')
                `)
                    .bind(discordUser.id)
                    .run();

                /*
                 * Remove expired one-time codes.
                 */
                await env.DB.prepare(`
                    DELETE FROM auth_codes
                    WHERE expires_at <= ?
                `)
                    .bind(Date.now())
                    .run();

                const loginCode =
                    crypto.randomUUID();

                const expiresAt =
                    Date.now() + 5 * 60 * 1000;

                await env.DB.prepare(`
                    INSERT INTO auth_codes (
                        code,
                        discord_id,
                        expires_at
                    )
                    VALUES (?, ?, ?)
                `)
                    .bind(
                        loginCode,
                        discordUser.id,
                        expiresAt
                    )
                    .run();

                const websiteCallback =
                    new URL(
                        `${WEBSITE_URL}/callback.html`
                    );

                websiteCallback.searchParams.set(
                    "code",
                    loginCode
                );

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location:
                            websiteCallback.toString(),
                        "Set-Cookie": [
                            "union_oauth_state=",
                            "HttpOnly",
                            "Secure",
                            "SameSite=Lax",
                            "Path=/",
                            "Max-Age=0"
                        ].join("; ")
                    }
                });
            } catch (error) {
                return json(
                    {
                        success: false,
                        error:
                            "Discord login failed.",
                        details:
                            error instanceof Error
                                ? error.message
                                : String(error)
                    },
                    500
                );
            }
        }

        /*
         * Exchange the temporary login code
         * for a real session.
         *
         * This is the route callback.html uses.
         */
        if (
            (
                url.pathname === "/auth/callback" ||
                url.pathname ===
                    "/api/auth/callback"
            ) &&
            request.method === "POST"
        ) {
            try {
                const body =
                    await readJsonBody(request);

                const code =
                    typeof body?.code === "string"
                        ? body.code.trim()
                        : "";

                if (!code) {
                    return json(
                        {
                            success: false,
                            error:
                                "Missing login code."
                        },
                        400
                    );
                }

                const now = Date.now();

                const authCode =
                    await env.DB.prepare(`
                        SELECT
                            code,
                            discord_id,
                            expires_at
                        FROM auth_codes
                        WHERE code = ?
                        LIMIT 1
                    `)
                        .bind(code)
                        .first();

                if (!authCode) {
                    return json(
                        {
                            success: false,
                            error:
                                "This login code is invalid or has already been used."
                        },
                        401
                    );
                }

                if (
                    Number(authCode.expires_at) <= now
                ) {
                    await env.DB.prepare(`
                        DELETE FROM auth_codes
                        WHERE code = ?
                    `)
                        .bind(code)
                        .run();

                    return json(
                        {
                            success: false,
                            error:
                                "This login code has expired. Please log in again."
                        },
                        401
                    );
                }

                const user =
                    await env.DB.prepare(`
                        SELECT
                            id,
                            union_id,
                            discord_id,
                            username,
                            discord_username,
                            discord_display_name,
                            avatar,
                            roles,
                            created_at
                        FROM users
                        WHERE discord_id = ?
                        LIMIT 1
                    `)
                        .bind(
                            authCode.discord_id
                        )
                        .first();

                if (!user) {
                    return json(
                        {
                            success: false,
                            error:
                                "The Discord user could not be found."
                        },
                        404
                    );
                }

                const sessionToken =
                    generateToken();

                const sessionExpiresAt =
                    now + SESSION_LENGTH_MS;

                /*
                 * Delete the one-time code before
                 * returning the session. It cannot
                 * be used for a second login.
                 */
                await env.DB.prepare(`
                    DELETE FROM auth_codes
                    WHERE code = ?
                `)
                    .bind(code)
                    .run();

                await env.DB.prepare(`
                    DELETE FROM sessions
                    WHERE expires_at <= ?
                `)
                    .bind(now)
                    .run();

                await env.DB.prepare(`
                    INSERT INTO sessions (
                        token,
                        discord_id,
                        expires_at
                    )
                    VALUES (?, ?, ?)
                `)
                    .bind(
                        sessionToken,
                        authCode.discord_id,
                        sessionExpiresAt
                    )
                    .run();

                return json({
                    success: true,
                    token: sessionToken,
                    expires_at:
                        sessionExpiresAt,
                    expiresAt:
                        sessionExpiresAt,
                    user: formatUser(user)
                });
            } catch (error) {
                return json(
                    {
                        success: false,
                        error:
                            "Failed to create login session.",
                        details:
                            error instanceof Error
                                ? error.message
                                : String(error)
                    },
                    500
                );
            }
        }

        /*
         * Return the currently logged-in user.
         */
        if (
            (
                url.pathname === "/auth/me" ||
                url.pathname === "/api/auth/me"
            ) &&
            request.method === "GET"
        ) {
            try {
                const authenticated =
                    await getAuthenticatedUser(
                        request,
                        env
                    );

                if (!authenticated) {
                    return json(
                        {
                            success: false,
                            error:
                                "You are not logged in or your session has expired."
                        },
                        401
                    );
                }

                return json({
                    success: true,
                    user: authenticated.user
                });
            } catch (error) {
                return json(
                    {
                        success: false,
                        error:
                            "Failed to check session.",
                        details:
                            error instanceof Error
                                ? error.message
                                : String(error)
                    },
                    500
                );
            }
        }

        /*
         * Log out and invalidate the session.
         */
        if (
            (
                url.pathname === "/auth/logout" ||
                url.pathname ===
                    "/api/auth/logout"
            ) &&
            request.method === "POST"
        ) {
            const token =
                getBearerToken(request);

            if (token) {
                await env.DB.prepare(`
                    DELETE FROM sessions
                    WHERE token = ?
                `)
                    .bind(token)
                    .run();
            }

            return json({
                success: true,
                message:
                    "You have been logged out."
            });
        }
        /*
 * Create or get whitelist application
 */
if (
    url.pathname === "/api/applications/create" &&
    request.method === "POST"
) {
    try {
        const authenticated = await getAuthenticatedUser(request, env);

        if (!authenticated) {
            return json({
                success: false,
                error: "Not logged in."
            }, 401);
        }

        const user = authenticated.user;

        let application = await env.DB.prepare(`
            SELECT *
            FROM applications
            WHERE discord_id = ?
            LIMIT 1
        `)
        .bind(user.discord_id)
        .first();

        if (!application) {

            await env.DB.prepare(`
                INSERT INTO applications (
                    discord_id,
                    union_id,
                    status,
                    progress,
                    last_saved_at,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(
                user.discord_id,
                user.union_id,
                "Draft",
                0,
                Date.now(),
                Date.now()
            )
            .run();

            application = await env.DB.prepare(`
                SELECT *
                FROM applications
                WHERE discord_id = ?
                LIMIT 1
            `)
            .bind(user.discord_id)
            .first();
        }

        return json({
            success: true,
            application
        });

    } catch (err) {
        return json({
            success: false,
            error: String(err)
        }, 500);
    }
}
/*
 * Get current user's whitelist application
 */
if (
    url.pathname === "/api/applications/me" &&
    request.method === "GET"
) {
    try {
        const authenticated = await getAuthenticatedUser(request, env);

        if (!authenticated) {
            return json(
                {
                    success: false,
                    error: "Not logged in."
                },
                401
            );
        }

        const application = await env.DB.prepare(`
            SELECT *
            FROM applications
            WHERE discord_id = ?
            ORDER BY id DESC
            LIMIT 1
        `)
        .bind(authenticated.user.discord_id)
        .first();

        return json({
            success: true,
            application: application || null
        });

    } catch (error) {
        return json(
            {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : String(error)
            },
            500
        );
    }
}
/*
 * Save whitelist application
 */
if (
    url.pathname === "/api/applications/save" &&
    request.method === "POST"
) {
    try {
        const authenticated = await getAuthenticatedUser(request, env);

        if (!authenticated) {
            return json({
                success: false,
                error: "Not logged in."
            }, 401);
        }

        const body = await readJsonBody(request);

        const application = await env.DB.prepare(`
            SELECT id, status
            FROM applications
            WHERE discord_id = ?
            ORDER BY id DESC
            LIMIT 1
        `)
        .bind(authenticated.user.discord_id)
        .first();

        if (!application) {
            return json({
                success: false,
                error: "No whitelist application exists."
            }, 404);
        }

        if (String(application.status || "").toLowerCase() !== "draft") {
            return json({
                success: false,
                error: "This application has already been submitted and can no longer be edited.",
                status: application.status
            }, 409);
        }

        await env.DB.prepare(`
            UPDATE applications
            SET
                data = ?,
                progress = ?,
                last_saved_at = ?,
                version = COALESCE(version, 0) + 1
            WHERE id = ?
        `)
        .bind(
            JSON.stringify(body?.data || {}),
            Number(body?.progress) || 0,
            Date.now(),
            application.id
        )
        .run();

        return json({
            success: true,
            message: "Application saved."
        });

    } catch (error) {
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : String(error)
        }, 500);
    }
}
/*
 * Submit whitelist application
 */
if (
    url.pathname === "/api/applications/submit" &&
    request.method === "POST"
) {
    try {
        const authenticated = await getAuthenticatedUser(request, env);

        if (!authenticated) {
            return json({
                success: false,
                error: "Not logged in."
            }, 401);
        }

        const body = await readJsonBody(request);

        const application = await env.DB.prepare(`
            SELECT *
            FROM applications
            WHERE discord_id = ?
            ORDER BY id DESC
            LIMIT 1
        `)
        .bind(authenticated.user.discord_id)
        .first();

        if (!application) {
            return json({
                success: false,
                error: "No whitelist application exists."
            }, 404);
        }

        if (String(application.status || "").toLowerCase() !== "draft") {
            return json({
                success: false,
                error: "This application has already been submitted.",
                application
            }, 409);
        }

        const submittedAt = Date.now();
        const finalData = body?.data ?? (() => {
            try {
                return JSON.parse(application.data || "{}");
            } catch {
                return {};
            }
        })();
        const finalProgress = Number(body?.progress ?? application.progress ?? 100) || 0;

        await env.DB.prepare(`
            UPDATE applications
            SET
                data = ?,
                progress = ?,
                status = 'Submitted',
                submitted_at = ?,
                last_saved_at = ?,
                version = COALESCE(version, 0) + 1
            WHERE id = ?
              AND status = 'Draft'
        `)
        .bind(
            JSON.stringify(finalData || {}),
            finalProgress,
            submittedAt,
            submittedAt,
            application.id
        )
        .run();

        const submittedApplication = await env.DB.prepare(`
            SELECT *
            FROM applications
            WHERE id = ?
            LIMIT 1
        `)
        .bind(application.id)
        .first();

        await sendDiscordWebhook(
            env.APPLICATION_WEBHOOK,
            applicationEmbed(
                submittedApplication,
                authenticated.user,
                "📋 New Whitelist Application",
                10833386
            )
        );

        return json({
            success: true,
            message: "Application submitted successfully.",
            application: submittedApplication
        });

    } catch (error) {
        return json({
            success: false,
            error: error instanceof Error
                ? error.message
                : String(error)
        }, 500);
    }
}
        /*
         * Staff: list database-backed whitelist applications.
         * Requires the logged-in Discord ID to be listed in STAFF_DISCORD_IDS.
         */
        if (
            url.pathname === "/api/staff/applications" &&
            request.method === "GET"
        ) {
            try {
                const staff = await requireStaff(request, env);
                if (staff.error) return staff.error;

                const status = String(url.searchParams.get("status") || "").trim();
                const search = String(url.searchParams.get("search") || "").trim();

                const conditions = ["LOWER(COALESCE(a.status, '')) <> 'draft'"];
                const bindings = [];

                if (status) {
                    conditions.push("LOWER(a.status) = LOWER(?)");
                    bindings.push(status);
                }

                if (search) {
                    conditions.push(`(
                        a.union_id LIKE ? OR
                        a.discord_id LIKE ? OR
                        u.discord_username LIKE ? OR
                        u.discord_display_name LIKE ?
                    )`);
                    const like = `%${search}%`;
                    bindings.push(like, like, like, like);
                }

                const statement = env.DB.prepare(`
                    SELECT
                        a.*,
                        u.discord_username,
                        u.discord_display_name,
                        u.avatar
                    FROM applications AS a
                    LEFT JOIN users AS u
                        ON u.discord_id = a.discord_id
                    WHERE ${conditions.join(" AND ")}
                    ORDER BY
                        COALESCE(a.submitted_at, a.updated_at, a.created_at) DESC,
                        a.id DESC
                `);

                const result = bindings.length
                    ? await statement.bind(...bindings).all()
                    : await statement.all();

                return json({
                    success: true,
                    applications: result.results || []
                });
            } catch (error) {
                return json({
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }, 500);
            }
        }

        /*
         * Staff: read one whitelist application.
         * Supports /api/staff/application/:id and /api/staff/applications/:id.
         */
        const staffApplicationMatch = url.pathname.match(
            /^\/api\/staff\/applications?\/(\d+)$/
        );

        if (staffApplicationMatch && request.method === "GET") {
            try {
                const staff = await requireStaff(request, env);
                if (staff.error) return staff.error;

                const applicationId = Number(staffApplicationMatch[1]);
                const application = await env.DB.prepare(`
                    SELECT
                        a.*,
                        u.discord_username,
                        u.discord_display_name,
                        u.avatar
                    FROM applications AS a
                    LEFT JOIN users AS u
                        ON u.discord_id = a.discord_id
                    WHERE a.id = ?
                    LIMIT 1
                `)
                .bind(applicationId)
                .first();

                if (!application) {
                    return json({
                        success: false,
                        error: "Application not found."
                    }, 404);
                }

                return json({
                    success: true,
                    application
                });
            } catch (error) {
                return json({
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }, 500);
            }
        }

        /*
         * Staff: review one whitelist application.
         * POST /api/staff/application/:id/review
         */
        const staffReviewMatch = url.pathname.match(
            /^\/api\/staff\/applications?\/(\d+)\/review$/
        );

        if (staffReviewMatch && request.method === "POST") {
            try {
                const staff = await requireStaff(request, env);
                if (staff.error) return staff.error;

                const body = await readJsonBody(request);
                const allowedStatuses = [
                    "Submitted",
                    "Pending Review",
                    "Interview",
                    "Accepted",
                    "Declined"
                ];

                const requestedStatus = String(body?.status || "").trim();
                const status = allowedStatuses.find(
                    item => item.toLowerCase() === requestedStatus.toLowerCase()
                );

                if (!status) {
                    return json({
                        success: false,
                        error: "Invalid application status."
                    }, 400);
                }

                const applicationId = Number(staffReviewMatch[1]);
                const reviewedAt = Date.now();
                const reviewerNotes = String(body?.reviewer_notes ?? body?.reviewerNotes ?? "").trim();
                const staffResponse = String(body?.staff_response ?? body?.staffResponse ?? "").trim();

                const existing = await env.DB.prepare(`
                    SELECT id
                    FROM applications
                    WHERE id = ?
                    LIMIT 1
                `)
                .bind(applicationId)
                .first();

                if (!existing) {
                    return json({
                        success: false,
                        error: "Application not found."
                    }, 404);
                }

                await env.DB.prepare(`
                    UPDATE applications
                    SET
                        status = ?,
                        reviewed_at = ?,
                        reviewed_by = ?,
                        reviewer_notes = ?,
                        staff_response = ?,
                        updated_at = CURRENT_TIMESTAMP,
                        version = COALESCE(version, 0) + 1
                    WHERE id = ?
                `)
                .bind(
                    status,
                    reviewedAt,
                    staff.user.discord_id,
                    reviewerNotes,
                    staffResponse,
                    applicationId
                )
                .run();

                const application = await env.DB.prepare(`
                    SELECT
                        a.*,
                        u.discord_username,
                        u.discord_display_name,
                        u.avatar
                    FROM applications AS a
                    LEFT JOIN users AS u
                        ON u.discord_id = a.discord_id
                    WHERE a.id = ?
                    LIMIT 1
                `)
                .bind(applicationId)
                .first();

                const reviewColors = {
                    Accepted: 5763719,
                    Declined: 15548997,
                    Interview: 16705372,
                    "Pending Review": 16705372,
                    Submitted: 10833386
                };

                await sendDiscordWebhook(
                    env.APPLICATION_REVIEW_WEBHOOK || env.APPLICATION_WEBHOOK,
                    applicationEmbed(
                        application,
                        {
                            union_id: application.union_id,
                            displayName: application.discord_display_name || application.discord_username
                        },
                        status === "Accepted"
                            ? "✅ Application Accepted"
                            : status === "Declined"
                                ? "❌ Application Declined"
                                : status === "Interview"
                                    ? "🟡 Application Interview Requested"
                                    : "📝 Application Status Updated",
                        reviewColors[status] || 10833386
                    )
                );

                return json({
                    success: true,
                    message: "Application review updated.",
                    application
                });
            } catch (error) {
                return json({
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }, 500);
            }
        }

        /*
         * Get all users.
         */
        if (
            url.pathname === "/api/users" &&
            request.method === "GET"
        ) {
            try {
                const users =
                    await env.DB.prepare(`
                        SELECT *
                        FROM users
                        ORDER BY id DESC
                    `).all();

                return json(
                    users.results.map(formatUser)
                );
            } catch (error) {
                return json(
                    {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error)
                    },
                    500
                );
            }
        }

        /*
         * Database connection test.
         */
        if (
            url.pathname === "/api/test-db" &&
            request.method === "GET"
        ) {
            try {
                const result =
                    await env.DB.prepare(`
                        SELECT name
                        FROM sqlite_master
                        WHERE type = 'table'
                        ORDER BY name
                    `).all();

                return json({
                    success: true,
                    database: "connected",
                    tables: result.results
                });
            } catch (error) {
                return json(
                    {
                        success: false,
                        error:
                            "Database connection failed.",
                        details:
                            error instanceof Error
                                ? error.message
                                : String(error)
                    },
                    500
                );
            }
        }

        return json(
            {
                success: false,
                error: "Route not found"
            },
            404
        );
    }
};