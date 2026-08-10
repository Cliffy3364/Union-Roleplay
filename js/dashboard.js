document.addEventListener("DOMContentLoaded", async () => {

    if (!window.UnionAuth) return;

    const user = await UnionAuth.getCurrentUser();

    if (!user) return;

    const title = document.querySelector(".profile-placeholder h2");
    const subtitle = document.querySelector(".profile-placeholder p");
    const avatar = document.querySelector(".profile-avatar");

    if (title)
        title.textContent =
            user.discord_display_name ||
            user.discord_username ||
            user.username;

    if (subtitle)
        subtitle.textContent =
            user.union_id || "Union Roleplay Member";

    if (avatar) {

        if (user.avatar) {

            avatar.innerHTML = `
                <img
                    src="https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=128"
                    style="
                        width:100%;
                        height:100%;
                        border-radius:50%;
                        object-fit:cover;
                    ">
            `;

        } else {

            avatar.textContent =
                (user.discord_display_name || user.username || "U")
                .charAt(0)
                .toUpperCase();

        }

    }

});