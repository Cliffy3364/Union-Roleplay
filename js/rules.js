/* =========================================================
   UNION ROLEPLAY RULEBOOK

   ADDING A RULE:
   Find the correct section below and add:

   {
       id: "02.10",
       title: "Rule Name",
       punishment: "FailRP",
       description: "Explain the rule here.",
       enforcement: "Explain what normally happens if broken."
   }

   The website handles everything else automatically.
========================================================= */


const RULEBOOK = [

    /* =====================================================
       01 - COMMUNITY & CONDUCT
    ===================================================== */

    {
        number: "01",
        title: "Community & Conduct",

        description:
            "Community standards applying across Union Roleplay and its connected platforms.",

        rules: [

            {
                id: "01.1",

                title:
                    "Respect & Inclusion",

                punishment:
                    "Bannable",

                description:
                    "Harassment, discrimination, hate speech, targeted abuse or discriminatory slurs are prohibited within Union Roleplay.",

                enforcement:
                    "Serious incidents may result in an immediate ban. Lower-level or isolated behaviour may receive a warning, strike or temporary ban depending on severity."
            },

            {
                id: "01.2",

                title:
                    "OOC Conduct",

                punishment:
                    "FailRP",

                description:
                    "Arguments about rules, punishments or staff decisions must not take place during active roleplay. Continue the scene and report the issue afterwards.",

                enforcement:
                    "Minor incidents normally result in a warning. Repeated disruption may result in a strike or temporary ban."
            },

            {
                id: "01.3",

                title:
                    "Harassment & Targeting",

                punishment:
                    "Bannable",

                description:
                    "Repeatedly targeting, following or provoking another player for out-of-character reasons is considered harassment.",

                enforcement:
                    "May result in a temporary or permanent ban depending on severity, duration and previous history."
            },

            {
                id: "01.4",

                title:
                    "Real-World Threats & Doxxing",

                punishment:
                    "Permanent Ban",

                description:
                    "Threatening real-world violence, exposing private information, attempting to identify another player or encouraging others to do so is strictly prohibited.",

                enforcement:
                    "Permanent removal from Union Roleplay. Serious incidents may also be reported to the relevant platform or authorities where appropriate."
            },

            {
                id: "01.5",

                title:
                    "Disruptive Play & Trolling",

                punishment:
                    "Bannable",

                description:
                    "Joining the server with the intention of trolling, ruining scenes or deliberately testing the limits of the rules is prohibited.",

                enforcement:
                    "Usually results in a temporary ban. Obvious malicious trolling may result in a permanent ban."
            },

            {
                id: "01.6",

                title:
                    "Encouraging Rule Breaking",

                punishment:
                    "Bannable",

                description:
                    "Players must not encourage, organise or pressure other players into breaking server rules.",

                enforcement:
                    "Punishment will normally reflect the severity of the rule being encouraged."
            },

            {
                id: "01.7",

                title:
                    "Ban Evasion",

                punishment:
                    "Permanent Ban",

                description:
                    "Using alternate Discord, Cfx.re or game accounts to bypass an active ban is prohibited.",

                enforcement:
                    "Permanent ban. Additional accounts used for evasion may also be banned."
            },

            {
                id: "01.8",

                title:
                    "Age Requirement",

                punishment:
                    "Bannable",

                description:
                    "Players must meet Union Roleplay's minimum age requirement. Providing a false age may result in removal from the community.",

                enforcement:
                    "Underage players may be banned until they meet the required age. Deliberate deception may result in additional sanctions."
            },

            {
                id: "01.9",

                title:
                    "Common Sense",

                punishment:
                    "3-Strike System",

                description:
                    "Not every unrealistic or disruptive situation can be specifically listed. Players are expected to use reasonable judgement and prioritise good roleplay.",

                enforcement:
                    "Warnings or strikes may be issued where behaviour clearly falls below expected standards despite not being explicitly listed elsewhere."
            },

            {
                id: "01.10",

                title:
                    "Real Money Trading",

                punishment:
                    "Permanent Ban",

                description:
                    "Selling or purchasing in-game money, vehicles, businesses, items or services for real-world money outside authorised Union Roleplay systems is prohibited.",

                enforcement:
                    "Permanent ban and removal of any associated assets."
            },

            {
                id: "01.11",

                title:
                    "Infrastructure Abuse",

                punishment:
                    "Permanent Ban",

                description:
                    "Attacking, attempting to damage, exploit or interfere with Union Roleplay infrastructure, bots, databases, websites or services is prohibited.",

                enforcement:
                    "Permanent ban."
            }

        ]
    },


    /* =====================================================
       02 - ROLEPLAY STANDARDS
    ===================================================== */

    {
        number: "02",

        title:
            "Roleplay Standards",

        description:
            "The core standards required for serious and believable roleplay.",

        rules: [

            {
                id: "02.1",

                title:
                    "FailRP",

                punishment:
                    "FailRP",

                description:
                    "FailRP is behaviour that is unrealistic, ignores the situation around you or significantly damages the quality of an active roleplay scene.",

                enforcement:
                    "A first minor offence will normally receive a verbal warning or strike. Repeated or serious FailRP may result in temporary bans. Continued offences may lead to longer bans or whitelist removal."
            },

            {
                id: "02.2",

                title:
                    "Remain In Character",

                punishment:
                    "FailRP",

                description:
                    "Players must remain in character during active roleplay unless a staff member explicitly pauses or ends the scene.",

                enforcement:
                    "Warning or strike for minor incidents. Repeated disruption may result in a temporary ban."
            },

            {
                id: "02.3",

                title:
                    "Metagaming",

                punishment:
                    "Bannable",

                description:
                    "Using information your character could not reasonably know is prohibited. This includes information obtained from Discord, streams, messages or another character.",

                enforcement:
                    "Normally results in a strike or temporary ban. Serious or repeated metagaming may result in longer bans."
            },

            {
                id: "02.4",

                title:
                    "Powergaming",

                punishment:
                    "FailRP",

                description:
                    "Forcing actions or outcomes on another player without giving them a reasonable opportunity to respond is prohibited.",

                enforcement:
                    "Warning or strike for minor incidents. Serious or repeated cases may result in temporary bans."
            },

            {
                id: "02.5",

                title:
                    "FearRP",

                punishment:
                    "FailRP",

                description:
                    "Characters must show reasonable fear when faced with genuine threats to their life or safety.",

                enforcement:
                    "Warning or strike for isolated incidents. Serious or repeated breaches may result in a temporary ban."
            },

            {
                id: "02.6",

                title:
                    "New Life Rule",

                punishment:
                    "FailRP",

                description:
                    "After your character dies or is forced to respawn, you must not immediately return to the same situation or use information your character would no longer reasonably remember.",

                enforcement:
                    "Normally a warning or strike. Returning specifically to influence or retaliate in the previous scene may result in a temporary ban."
            },

            {
                id: "02.7",

                title:
                    "Combat Logging",

                punishment:
                    "Bannable",

                description:
                    "Disconnecting, force-closing the game or intentionally causing a timeout to avoid roleplay consequences is prohibited.",

                enforcement:
                    "Normally results in a temporary ban. Repeated combat logging may result in significantly longer bans."
            },

            {
                id: "02.8",

                title:
                    "Random Deathmatch",

                punishment:
                    "Bannable",

                description:
                    "Attacking or killing another player without sufficient roleplay reason, interaction or escalation is prohibited.",

                enforcement:
                    "Normally results in a temporary ban. Mass or malicious RDM may result in permanent removal."
            },

            {
                id: "02.9",

                title:
                    "Vehicle Deathmatch",

                punishment:
                    "Bannable",

                description:
                    "Using a vehicle as a weapon against another player without a valid and proportionate roleplay reason is prohibited.",

                enforcement:
                    "Normally results in a temporary ban. Deliberate mass VDM may result in permanent removal."
            },

            {
                id: "02.10",

                title:
                    "Forced Roleplay",

                punishment:
                    "FailRP",

                description:
                    "Players must not force another character into an outcome without reasonable opportunity for roleplay or response.",

                enforcement:
                    "Warning or strike for minor breaches. Serious incidents may receive temporary bans."
            },

            {
                id: "02.11",

                title:
                    "Unrealistic Escalation",

                punishment:
                    "FailRP",

                description:
                    "Minor arguments or disagreements should not immediately become extreme violence, kidnappings or major incidents without meaningful escalation.",

                enforcement:
                    "Usually a warning or strike. Repeated behaviour may result in a temporary ban."
            },

            {
                id: "02.12",

                title:
                    "Scene Interference",

                punishment:
                    "FailRP",

                description:
                    "Players must not deliberately interfere with active scenes they have no reasonable involvement in simply to create action.",

                enforcement:
                    "Warning or strike. Repeated or malicious interference may result in temporary bans."
            }

        ]
    },


    /* =====================================================
       03 - IN-GAME CONDUCT
    ===================================================== */

    {
        number: "03",

        title:
            "In-Game Conduct",

        description:
            "Behaviour standards covering general activity throughout Union City.",

        rules: [

            {
                id: "03.1",

                title:
                    "Unrealistic Driving",

                punishment:
                    "FailRP",

                description:
                    "Driving must remain reasonably realistic for the vehicle, road conditions and situation. Constant high-speed reckless driving without roleplay reason is prohibited.",

                enforcement:
                    "Warning or strike. Persistent unrealistic driving may result in temporary driving restrictions or bans."
            },

            {
                id: "03.2",

                title:
                    "Vehicle Abuse",

                punishment:
                    "FailRP",

                description:
                    "Players must not repeatedly crash, launch, ram or deliberately destroy vehicles simply because game mechanics allow it.",

                enforcement:
                    "Warning or strike. Serious intentional abuse may result in a temporary ban."
            },

            {
                id: "03.3",

                title:
                    "Microphone Abuse",

                punishment:
                    "3-Strike System",

                description:
                    "Soundboards, excessive screaming, distorted microphones or intentionally disruptive audio must not negatively affect other players.",

                enforcement:
                    "Warning followed by strikes. Continued abuse may result in removal from the server."
            },

            {
                id: "03.4",

                title:
                    "Respawning to Avoid Roleplay",

                punishment:
                    "Bannable",

                description:
                    "Players must not manually respawn, deliberately die or otherwise reset their character to escape an active situation.",

                enforcement:
                    "Temporary ban in serious cases. Minor accidental incidents may receive a warning."
            },

            {
                id: "03.5",

                title:
                    "Abuse of Game Mechanics",

                punishment:
                    "Bannable",

                description:
                    "Using animations, menus, vehicle mechanics or game behaviour in unintended ways to gain an advantage is prohibited.",

                enforcement:
                    "Warning, strike or temporary ban depending on severity. Exploits are handled more severely under Section 07."
            },

            {
                id: "03.6",

                title:
                    "Unrealistic Character Behaviour",

                punishment:
                    "FailRP",

                description:
                    "Characters must behave in a way that makes sense for the situation and their established role.",

                enforcement:
                    "Warning or strike. Repeated behaviour may result in character restrictions or temporary bans."
            }

        ]
    },


    /* =====================================================
       04 - POLICE, UHS & CIVIL SERVICES
    ===================================================== */

    {
        number: "04",

        title:
            "Police, UHS & Civil Services",

        description:
            "Standards applying to emergency services and public-service roleplay.",

        rules: [

            {
                id: "04.1",

                title:
                    "Department Standards",

                punishment:
                    "Department Action",

                description:
                    "Emergency-service members must follow their department procedures, training standards and chain of command.",

                enforcement:
                    "May result in retraining, suspension, demotion or removal from the department alongside staff sanctions where appropriate."
            },

            {
                id: "04.2",

                title:
                    "Misuse of Department Equipment",

                punishment:
                    "Department Action",

                description:
                    "Department vehicles, equipment and systems must only be used for legitimate roleplay and authorised duties.",

                enforcement:
                    "Department discipline and possible staff strike. Serious misuse may result in removal from the department."
            },

            {
                id: "04.3",

                title:
                    "Emergency Vehicle Abuse",

                punishment:
                    "FailRP",

                description:
                    "Lights and sirens must not be used simply to bypass traffic, speed without reason or gain an unnecessary advantage.",

                enforcement:
                    "Warning, retraining or department strike. Repeated abuse may result in removal of emergency driving permissions."
            },

            {
                id: "04.4",

                title:
                    "Medical Roleplay",

                punishment:
                    "FailRP",

                description:
                    "Medical treatment must be roleplayed seriously and proportionately. Injuries must not be instantly ignored simply because game mechanics allow it.",

                enforcement:
                    "Warning or strike. Repeated poor medical roleplay may result in department retraining or temporary removal."
            },

            {
                id: "04.5",

                title:
                    "Scene Priority",

                punishment:
                    "3-Strike System",

                description:
                    "Emergency-service members must prioritise active roleplay scenes and avoid unnecessarily abandoning incidents.",

                enforcement:
                    "Department warning or strike. Repeated behaviour may result in disciplinary action."
            },

            {
                id: "04.6",

                title:
                    "Unauthorised Corruption",

                punishment:
                    "Bannable",

                description:
                    "Corrupt emergency-service roleplay must not be carried out without explicit management approval where required.",

                enforcement:
                    "Character or department removal and possible temporary ban depending on severity."
            }

        ]
    },


    /* =====================================================
       05 - CIVILIAN & BUSINESS CONDUCT
    ===================================================== */

    {
        number: "05",

        title:
            "Civilian & Business Conduct",

        description:
            "Standards for civilians, employment, businesses and the player-driven economy.",

        rules: [

            {
                id: "05.1",

                title:
                    "Economy Abuse",

                punishment:
                    "Bannable",

                description:
                    "Players must not manipulate jobs, businesses or game systems in unintended ways to generate unrealistic amounts of money or assets.",

                enforcement:
                    "Assets may be removed. Serious or deliberate abuse may result in temporary or permanent bans."
            },

            {
                id: "05.2",

                title:
                    "Unrealistic Asset Transfers",

                punishment:
                    "Bannable",

                description:
                    "Large transfers of money, vehicles or valuable assets must have a legitimate in-character reason.",

                enforcement:
                    "Transactions may be reversed. Deliberate attempts to bypass economy rules may result in strikes or bans."
            },

            {
                id: "05.3",

                title:
                    "Scamming",

                punishment:
                    "Bannable",

                description:
                    "Scams must remain within any limits set by server policy and must be supported by genuine roleplay. Abuse of interfaces or OOC deception is prohibited.",

                enforcement:
                    "Assets may be restored or removed. Serious cases may result in temporary bans."
            },

            {
                id: "05.4",

                title:
                    "Employment Abuse",

                punishment:
                    "3-Strike System",

                description:
                    "Players must not abuse job permissions, employer systems or shared business resources for personal gain.",

                enforcement:
                    "Warning, business strike or removal from the role depending on severity."
            },

            {
                id: "05.5",

                title:
                    "Property Abuse",

                punishment:
                    "FailRP",

                description:
                    "Properties must not be used to intentionally break scenes, hide from consequences through game mechanics or trap other players unfairly.",

                enforcement:
                    "Warning or strike. Serious incidents may result in property removal or temporary bans."
            }

        ]
    },


    /* =====================================================
       06 - ZONES & RESTRICTED AREAS
    ===================================================== */

    {
        number: "06",

        title:
            "Zones & Restricted Areas",

        description:
            "Rules applying to sensitive, protected and restricted locations.",

        rules: [

            {
                id: "06.1",

                title:
                    "Hospital Areas",

                punishment:
                    "FailRP",

                description:
                    "Hospitals must not be treated as locations for unnecessary violence, trolling or deliberately disruptive behaviour.",

                enforcement:
                    "Warning or strike. Serious deliberate disruption may result in a temporary ban."
            },

            {
                id: "06.2",

                title:
                    "Police Facilities",

                punishment:
                    "FailRP",

                description:
                    "Police stations and secure facilities must only be entered where there is a genuine roleplay reason.",

                enforcement:
                    "Warning or strike. Deliberate trolling or repeated intrusion may result in a temporary ban."
            },

            {
                id: "06.3",

                title:
                    "Spawn & Character Areas",

                punishment:
                    "Bannable",

                description:
                    "Players must not camp, attack or deliberately target players immediately after spawning or entering the server.",

                enforcement:
                    "Normally a temporary ban where deliberate targeting is established."
            },

            {
                id: "06.4",

                title:
                    "Restricted Locations",

                punishment:
                    "FailRP",

                description:
                    "Areas clearly identified as restricted must not be entered without a believable reason or authorised roleplay.",

                enforcement:
                    "Warning or strike. Repeated breaches may result in temporary bans."
            }

        ]
    },


    /* =====================================================
       07 - EXPLOITS, CHEATS & INTEGRITY
    ===================================================== */

    {
        number: "07",

        title:
            "Exploits, Cheats & Integrity",

        description:
            "Zero-tolerance rules protecting server security and fairness.",

        rules: [

            {
                id: "07.1",

                title:
                    "Cheating",

                punishment:
                    "Permanent Ban",

                description:
                    "Using mod menus, injected cheats, aim assistance, wall hacks or other unauthorised software to gain an advantage is prohibited.",

                enforcement:
                    "Permanent ban."
            },

            {
                id: "07.2",

                title:
                    "Exploiting",

                punishment:
                    "Permanent Ban",

                description:
                    "Knowingly abusing a bug, duplication method or unintended server mechanic for personal gain is prohibited.",

                enforcement:
                    "Serious deliberate exploitation will normally result in a permanent ban and removal of exploited assets."
            },

            {
                id: "07.3",

                title:
                    "Duplication",

                punishment:
                    "Permanent Ban",

                description:
                    "Duplicating money, vehicles, items or any other assets is prohibited.",

                enforcement:
                    "Permanent ban and removal of duplicated assets."
            },

            {
                id: "07.4",

                title:
                    "Unauthorised Third-Party Tools",

                punishment:
                    "Permanent Ban",

                description:
                    "Software that manipulates the game or server in order to gain an unfair advantage is prohibited.",

                enforcement:
                    "Permanent ban."
            },

            {
                id: "07.5",

                title:
                    "Macro Abuse",

                punishment:
                    "Bannable",

                description:
                    "Automating gameplay actions for economic or mechanical advantage is prohibited unless specifically approved.",

                enforcement:
                    "Temporary ban and removal of gains. Repeated abuse may result in permanent removal."
            },

            {
                id: "07.6",

                title:
                    "Reporting Exploits",

                punishment:
                    "3-Strike System",

                description:
                    "Players who discover an exploit must stop using it and report it privately to staff as soon as reasonably possible.",

                enforcement:
                    "Failing to report an exploit while continuing to benefit from it may be treated as deliberate exploitation."
            }

        ]
    },


    /* =====================================================
       08 - BUSINESS MANAGEMENT
    ===================================================== */

    {
        number: "08",

        title:
            "Business Management",

        description:
            "Standards applying to owners and managers of approved Union Roleplay businesses.",

        rules: [

            {
                id: "08.1",

                title:
                    "Opening Hours",

                punishment:
                    "Business Strike",

                description:
                    "Businesses must remain reasonably active and meet any minimum opening requirements set by Union Roleplay management.",

                enforcement:
                    "Business warning or strike. Continued inactivity may result in ownership being revoked."
            },

            {
                id: "08.2",

                title:
                    "Owner Accountability",

                punishment:
                    "Business Strike",

                description:
                    "Owners are responsible for ensuring employees understand and follow both server rules and business-specific requirements.",

                enforcement:
                    "Warnings or business strikes may be issued. Serious mismanagement may result in ownership removal."
            },

            {
                id: "08.3",

                title:
                    "Business Funds",

                punishment:
                    "Business Shutdown",

                description:
                    "Business accounts and resources must not be intentionally drained, transferred or abused for personal enrichment.",

                enforcement:
                    "Funds may be reversed. Ownership may be removed and serious abuse may result in staff sanctions."
            },

            {
                id: "08.4",

                title:
                    "Business Activity",

                punishment:
                    "Business Strike",

                description:
                    "Businesses must provide genuine interaction and roleplay rather than existing solely to generate passive income.",

                enforcement:
                    "Warning or strike. Repeated inactivity may result in the business being reassigned."
            },

            {
                id: "08.5",

                title:
                    "Business Rule Breaches",

                punishment:
                    "Business Shutdown",

                description:
                    "Repeated serious rule breaches connected directly to a business may result in management action against the business itself.",

                enforcement:
                    "Possible suspension, ownership removal or permanent closure depending on severity."
            }

        ]
    },


    /* =====================================================
       09 - STRICT ROLEPLAY ENFORCEMENT
    ===================================================== */

    {
        number: "09",

        title:
            "Strict Roleplay Enforcement",

        description:
            "Additional standards supporting believable, consequence-driven and high-quality roleplay.",

        rules: [

            {
                id: "09.1",

                title:
                    "Character Consistency",

                punishment:
                    "3-Strike System",

                description:
                    "A character's behaviour, skills, relationships and decisions should remain consistent with their established story.",

                enforcement:
                    "Warning or strike. Repeated unrealistic character switching may result in character restrictions."
            },

            {
                id: "09.2",

                title:
                    "Consequence Avoidance",

                punishment:
                    "Bannable",

                description:
                    "Players must not use character deletion, asset transfers, job changes, disconnecting or other methods to avoid legitimate roleplay consequences.",

                enforcement:
                    "Transactions or changes may be reversed. Serious cases may result in a temporary ban."
            },

            {
                id: "09.3",

                title:
                    "Information Dumping",

                punishment:
                    "FailRP",

                description:
                    "Characters must not instantly reveal large amounts of sensitive information without believable knowledge and a valid roleplay reason.",

                enforcement:
                    "Warning or strike. Serious metagaming connected to the information may result in stronger sanctions."
            },

            {
                id: "09.4",

                title:
                    "Scene Quality",

                punishment:
                    "3-Strike System",

                description:
                    "Players are expected to create meaningful interaction rather than constantly rushing scenes purely to obtain money, arrests, chases or action.",

                enforcement:
                    "Coaching, warning or strike. Persistent poor-quality roleplay may result in temporary whitelist restrictions."
            },

            {
                id: "09.5",

                title:
                    "Disposable Characters",

                punishment:
                    "Bannable",

                description:
                    "Creating characters purely to troll, transfer assets, gather information or avoid consequences is prohibited.",

                enforcement:
                    "Character deletion, asset reversal and temporary or permanent bans depending on severity."
            },

            {
                id: "09.6",

                title:
                    "Staff Direction During Scenes",

                punishment:
                    "Bannable",

                description:
                    "Players must follow reasonable staff directions during active incidents and continue roleplay unless explicitly told that the scene is paused.",

                enforcement:
                    "Warning or strike for minor refusal. Deliberate or repeated refusal may result in temporary bans."
            }

        ]
    }

];


/* =========================================================
   PUNISHMENT COLOURS

   If you add a NEW punishment type, add its class here.
========================================================= */

function punishmentClass(
    punishment
) {

    const value =
        String(
            punishment || ""
        )
        .toLowerCase();


    if (
        value.includes(
            "permanent"
        )
    ) {

        return "punishment-permanent-ban";
    }


    if (
        value.includes(
            "failrp"
        )
    ) {

        return "punishment-failrp";
    }


    if (
        value.includes(
            "business shutdown"
        )
    ) {

        return "punishment-business-shutdown";
    }


    if (
        value.includes(
            "business"
        )
    ) {

        return "punishment-strike";
    }


    if (
        value.includes(
            "department"
        )
    ) {

        return "punishment-strike";
    }


    if (
        value.includes(
            "strike"
        )
    ) {

        return "punishment-strike";
    }


    return "punishment-bannable";
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeRuleHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   CREATE SIDEBAR
========================================================= */

function renderRuleNavigation() {

    const navigation =
        document.getElementById(
            "rulesNavigation"
        );


    if (!navigation) {

        return;
    }


    navigation.innerHTML =
        RULEBOOK
            .map(
                section => {

                    const id =
                        `rule-section-${section.number}`;


                    return `
                        <a
                            href="#${id}"
                        >
                            ${escapeRuleHtml(section.number)}.
                            ${escapeRuleHtml(section.title)}
                        </a>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   CREATE RULEBOOK
========================================================= */

function renderRulebook() {

    const container =
        document.getElementById(
            "rulesContent"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        RULEBOOK
            .map(
                section => {

                    const sectionId =
                        `rule-section-${section.number}`;


                    const rules =
                        section.rules
                            .map(
                                rule => {

                                    return `
                                        <details
                                            class="rule-item"
                                            data-rule-item
                                            data-rule-search="
                                                ${escapeRuleHtml(
                                                    `${rule.id} ${rule.title} ${rule.punishment} ${rule.description} ${rule.enforcement}`
                                                )}
                                            "
                                        >

                                            <summary>

                                                <span class="rule-id">
                                                    ${escapeRuleHtml(rule.id)}
                                                </span>

                                                <span class="rule-title">
                                                    ${escapeRuleHtml(rule.title)}
                                                </span>

                                                <span
                                                    class="
                                                        punishment
                                                        ${punishmentClass(rule.punishment)}
                                                    "
                                                >
                                                    ${escapeRuleHtml(rule.punishment)}
                                                </span>

                                                <span class="rule-toggle">
                                                    +
                                                </span>

                                            </summary>


                                            <div class="rule-body">

                                                <p>
                                                    ${escapeRuleHtml(rule.description)}
                                                </p>

                                                <div class="rule-enforcement">

                                                    <strong>
                                                        Enforcement
                                                    </strong>

                                                    <span>
                                                        ${escapeRuleHtml(rule.enforcement)}
                                                    </span>

                                                </div>

                                            </div>

                                        </details>
                                    `;
                                }
                            )
                            .join("");


                    return `
                        <section
                            class="rule-category"
                            id="${sectionId}"
                            data-rule-category
                        >

                            <div class="rule-category-header">

                                <span class="rule-number">
                                    ${escapeRuleHtml(section.number)}
                                </span>

                                <div>

                                    <span class="rule-category-label">
                                        SECTION ${escapeRuleHtml(section.number)}
                                    </span>

                                    <h2>
                                        ${escapeRuleHtml(section.title)}
                                    </h2>

                                    <p>
                                        ${escapeRuleHtml(section.description)}
                                    </p>

                                </div>

                            </div>


                            <div class="rule-category-items">

                                ${rules}

                            </div>

                        </section>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   SEARCH
========================================================= */

function setupRuleSearch() {

    const searchInput =
        document.getElementById(
            "rulesSearch"
        );


    const noResults =
        document.getElementById(
            "rulesNoResults"
        );


    if (!searchInput) {

        return;
    }


    function updateSearch() {

        const query =
            String(
                searchInput.value || ""
            )
            .trim()
            .toLowerCase();


        const rules =
            Array.from(
                document.querySelectorAll(
                    "[data-rule-item]"
                )
            );


        let visibleRules = 0;


        rules.forEach(
            rule => {

                const searchable =
                    String(
                        rule.dataset.ruleSearch ||
                        rule.textContent ||
                        ""
                    )
                    .toLowerCase();


                const matches =
                    !query ||
                    searchable.includes(
                        query
                    );


                rule.hidden =
                    !matches;


                if (matches) {

                    visibleRules++;


                    if (query) {

                        rule.open = true;
                    }

                } else {

                    rule.open = false;
                }

            }
        );


        document
            .querySelectorAll(
                "[data-rule-category]"
            )
            .forEach(
                category => {

                    const categoryRules =
                        Array.from(
                            category.querySelectorAll(
                                "[data-rule-item]"
                            )
                        );


                    category.hidden =
                        !categoryRules.some(
                            rule =>
                                !rule.hidden
                        );
                }
            );


        if (noResults) {

            noResults.hidden =
                visibleRules > 0;
        }
    }


    searchInput.addEventListener(
        "input",
        updateSearch
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                searchInput.value = "";

                updateSearch();

                searchInput.blur();
            }
        }
    );
}


/* =========================================================
   ONLY ONE OPEN RULE PER SECTION
========================================================= */

function setupRuleAccordions() {

    document
        .querySelectorAll(
            "[data-rule-item]"
        )
        .forEach(
            rule => {

                rule.addEventListener(
                    "toggle",
                    () => {

                        if (!rule.open) {

                            return;
                        }


                        const section =
                            rule.closest(
                                "[data-rule-category]"
                            );


                        if (!section) {

                            return;
                        }


                        section
                            .querySelectorAll(
                                "[data-rule-item]"
                            )
                            .forEach(
                                otherRule => {

                                    if (
                                        otherRule !== rule &&
                                        otherRule.open
                                    ) {

                                        otherRule.open =
                                            false;
                                    }
                                }
                            );
                    }
                );
            }
        );
}


/* =========================================================
   SIDEBAR SCROLLING
========================================================= */

function setupRuleNavigation() {

    document
        .querySelectorAll(
            ".rules-navigation a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            !href.startsWith("#")
                        ) {

                            return;
                        }


                        const target =
                            document.querySelector(
                                href
                            );


                        if (!target) {

                            return;
                        }


                        event.preventDefault();


                        const top =
                            target
                                .getBoundingClientRect()
                                .top +
                            window.scrollY -
                            96;


                        window.scrollTo({

                            top,

                            behavior:
                                "smooth"
                        });
                    }
                );
            }
        );
}


/* =========================================================
   START RULEBOOK
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderRuleNavigation();

        renderRulebook();

        setupRuleSearch();

        setupRuleAccordions();

        setupRuleNavigation();

    }
);