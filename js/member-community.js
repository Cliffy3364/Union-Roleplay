/* The District — authenticated character dashboard and leaderboards */
(function () {
    const API = "https://the-district-api.danielclifford2808.workers.dev";

    function esc(value) {
        return String(value ?? "")
            .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
            .replaceAll('"',"&quot;").replaceAll("'","&#039;");
    }

    function money(value) {
        const n = Number(value || 0);
        return new Intl.NumberFormat("en-GB", {
            style: "currency", currency: "GBP", maximumFractionDigits: 0
        }).format(Number.isFinite(n) ? n : 0);
    }

    function num(value) {
        const n = Number(value || 0);
        return Number.isFinite(n) ? n : 0;
    }

    function characterName(character) {
        if (character?.name) return character.name;
        const info = character?.charinfo || character?.character || {};
        const joined = [info.firstname, info.lastname].filter(Boolean).join(" ");
        return joined || character?.character_name || character?.citizenid || "District Character";
    }

    function characterJob(character) {
        const job = character?.job || {};
        const label = job.label || job.name || character?.job_label || "Civilian";
        const grade = job.grade?.name || job.grade_name || character?.job_grade || "";
        return grade ? `${label} • ${grade}` : label;
    }

    function moneyParts(character) {
        const value = character?.money || character?.accounts || {};
        const cash = num(value.cash ?? character?.cash);
        const bank = num(value.bank ?? character?.bank);
        const total = num(character?.total_money ?? character?.money_total ?? (cash + bank));
        return { cash, bank, total };
    }

    function vehicleName(vehicle) {
        return vehicle?.name || vehicle?.label || vehicle?.model || vehicle?.vehicle || "Vehicle";
    }

    function vehicleValue(vehicle) {
        return num(vehicle?.value ?? vehicle?.price ?? vehicle?.estimated_value ?? vehicle?.purchase_price);
    }

    function normalizeProfile(data, user) {
        const profile = data?.profile || data?.member || data || {};
        const characters =
            profile.characters ||
            data?.characters ||
            user?.characters ||
            user?.character_data ||
            [];

        const globalVehicles = profile.vehicles || data?.vehicles || user?.vehicles || [];

        return {
            characters: Array.isArray(characters) ? characters : [],
            vehicles: Array.isArray(globalVehicles) ? globalVehicles : []
        };
    }

    function vehiclesForCharacter(character, globalVehicles) {
        if (Array.isArray(character?.vehicles)) return character.vehicles;
        const citizen = character?.citizenid || character?.citizen_id || character?.id;
        if (!citizen) return [];
        return globalVehicles.filter(vehicle =>
            String(vehicle?.citizenid ?? vehicle?.citizen_id ?? vehicle?.owner_id ?? "") === String(citizen)
        );
    }

    function renderVehicle(vehicle) {
        const value = vehicleValue(vehicle);
        return `
            <div class="member-vehicle-row">
                <div class="member-vehicle-icon">CAR</div>
                <div class="member-vehicle-main">
                    <strong>${esc(vehicleName(vehicle))}</strong>
                    <span>${esc(vehicle?.plate || "NO PLATE")} • ${esc(vehicle?.garage || vehicle?.state_label || "Unknown garage")}</span>
                </div>
                <div class="member-vehicle-value">${value ? money(value) : "—"}</div>
            </div>
        `;
    }

    function renderCharacter(character, vehicles) {
        const m = moneyParts(character);
        const citizen = character?.citizenid || character?.citizen_id || "CHARACTER";
        return `
            <article class="member-character-card">
                <div class="member-character-top">
                    <div>
                        <span class="member-character-id">${esc(citizen)}</span>
                        <h3>${esc(characterName(character))}</h3>
                        <p>${esc(characterJob(character))}</p>
                    </div>
                    <div class="member-character-total"><span>TOTAL MONEY</span><strong>${money(m.total)}</strong></div>
                </div>

                <div class="member-money-grid">
                    <div><span>CASH</span><strong>${money(m.cash)}</strong></div>
                    <div><span>BANK</span><strong>${money(m.bank)}</strong></div>
                    <div><span>VEHICLES</span><strong>${vehicles.length}</strong></div>
                </div>

                <div class="member-vehicles-head"><span>VEHICLES</span><small>${vehicles.length} owned</small></div>
                <div class="member-vehicle-list">
                    ${vehicles.length ? vehicles.map(renderVehicle).join("") : '<div class="member-no-vehicles">No vehicles connected to this character.</div>'}
                </div>
            </article>
        `;
    }

    function renderProfile(profile) {
        const target = document.getElementById("memberCharacterList");
        const count = document.getElementById("memberCharacterCount");
        const vehicleCount = document.getElementById("memberVehicleCount");
        const totalMoney = document.getElementById("memberTotalMoney");
        const intro = document.getElementById("memberDashboardIntro");

        const characters = profile.characters;
        let allVehicles = 0;
        let allMoney = 0;

        characters.forEach(character => {
            const vehicles = vehiclesForCharacter(character, profile.vehicles);
            allVehicles += vehicles.length;
            allMoney += moneyParts(character).total;
        });

        if (count) count.textContent = String(characters.length);
        if (vehicleCount) vehicleCount.textContent = String(allVehicles);
        if (totalMoney) totalMoney.textContent = money(allMoney);
        if (intro) intro.textContent = characters.length
            ? "Your linked District characters and current city progress."
            : "Your Discord account is connected, but no game characters have been returned yet.";

        if (!target) return;

        if (!characters.length) {
            target.innerHTML = `
                <div class="member-data-empty">
                    <span>CHARACTER CONNECTION</span>
                    <h3>No linked character data yet.</h3>
                    <p>Your Discord sign-in is working. The website is ready to display QBOX characters, money and vehicles as soon as the member-data endpoint is connected to the game database.</p>
                </div>
            `;
            return;
        }

        target.innerHTML = characters.map(character =>
            renderCharacter(character, vehiclesForCharacter(character, profile.vehicles))
        ).join("");
    }

    async function fetchMemberProfile() {
        const token = DistrictAuth.getToken();
        const user = window.__DISTRICT_USER || await DistrictAuth.getCurrentUser();
        const embedded = normalizeProfile({}, user);
        if (embedded.characters.length) return embedded;

        const candidates = [
            "/api/community/member",
            "/api/community/profile",
            "/api/community/me"
        ];

        for (const path of candidates) {
            try {
                const response = await fetch(`${API}${path}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    cache: "no-store"
                });
                if (!response.ok) continue;
                const data = await response.json();
                if (data?.success === false) continue;
                const normalized = normalizeProfile(data, user);
                if (normalized.characters.length || normalized.vehicles.length) return normalized;
            } catch {}
        }

        return embedded;
    }

    function formatHours(entry) {
        if (entry?.formatted) return entry.formatted;
        const hours = num(entry?.hours ?? entry?.playtime_hours ?? entry?.playtime ?? entry?.duty_hours ?? entry?.duty_time);
        return `${hours.toLocaleString()} hrs`;
    }

    function entryName(entry) {
        return entry?.name || entry?.character_name || entry?.display_name || entry?.player || "Citizen";
    }

    function renderBoard(id, entries, formatter, subtitle) {
        const target = document.getElementById(id);
        if (!target) return;

        if (!Array.isArray(entries) || !entries.length) {
            target.innerHTML = `<div class="leaderboard-empty">${esc(subtitle || "No leaderboard data connected yet.")}</div>`;
            return;
        }

        target.innerHTML = entries.slice(0, 10).map((entry, index) => `
            <div class="member-board-row">
                <span class="member-board-rank">${String(index + 1).padStart(2,"0")}</span>
                <div class="member-board-player">
                    <strong>${esc(entryName(entry))}</strong>
                    <span>${esc(entry.department || entry.job || entry.vehicle_count ? (entry.department || entry.job || `${entry.vehicle_count} vehicles`) : "District Member")}</span>
                </div>
                <strong class="member-board-value">${esc(formatter(entry))}</strong>
            </div>
        `).join("");
    }

    async function loadLeaderboards() {
        try {
            const response = await fetch(`${API}/api/community/leaderboards`, {
                headers: { Authorization: `Bearer ${DistrictAuth.getToken()}`, Accept: "application/json" },
                cache: "no-store"
            });
            const data = await response.json();
            if (!response.ok || data?.success === false) throw new Error(data?.error || "Leaderboards unavailable");

            renderBoard("moneyLeaderboard", data.money || data.wealth || [], entry =>
                entry.formatted || money(entry.money ?? entry.net_worth ?? entry.total_money),
                "Money leaderboard is not connected."
            );

            renderBoard("vehicleLeaderboard",
                data.vehicles || data.car_collections || data.vehicle_collections || data.cars || [],
                entry => entry.formatted || money(entry.collection_value ?? entry.total_value ?? entry.value),
                "Car collection values need the vehicle leaderboard feed."
            );

            renderBoard("emergencyLeaderboard",
                data.emergency || data.emergency_service || data.emergency_representatives || [],
                entry => entry.formatted || formatHours(entry),
                "Emergency-service duty activity needs the duty leaderboard feed."
            );

            renderBoard("playtimeLeaderboard", data.playtime || data.gameplay || [], entry =>
                entry.formatted || formatHours(entry),
                "Playtime leaderboard is not connected."
            );
        } catch (error) {
            console.warn("Member leaderboards unavailable:", error);
            ["moneyLeaderboard","vehicleLeaderboard","emergencyLeaderboard","playtimeLeaderboard"].forEach(id => {
                const target = document.getElementById(id);
                if (target) target.innerHTML = '<div class="leaderboard-empty">Leaderboard data is currently unavailable.</div>';
            });
        }
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const profile = await fetchMemberProfile();
        renderProfile(profile);
        loadLeaderboards();
    });
})();