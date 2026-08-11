document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            document.getElementById(
                "rulesSearch"
            );

        const ruleItems =
            Array.from(
                document.querySelectorAll(
                    "[data-rule-item]"
                )
            );

        const categories =
            Array.from(
                document.querySelectorAll(
                    "[data-rule-category]"
                )
            );

        const noResults =
            document.getElementById(
                "rulesNoResults"
            );


        function normalise(value) {

            return String(value || "")
                .toLowerCase()
                .trim();
        }


        function updateRuleSearch() {

            const query =
                normalise(
                    searchInput?.value
                );

            let visibleRuleCount = 0;


            ruleItems.forEach(rule => {

                const text =
                    normalise(
                        rule.textContent
                    );

                const matches =
                    !query ||
                    text.includes(query);


                rule.hidden =
                    !matches;


                if (matches) {

                    visibleRuleCount++;

                    if (query) {
                        rule.open = true;
                    }
                }
            });


            categories.forEach(category => {

                const rules =
                    Array.from(
                        category.querySelectorAll(
                            "[data-rule-item]"
                        )
                    );

                /*
                 * Some sections currently only contain
                 * a heading and description.
                 * Keep those visible when there is
                 * no search active.
                 */

                if (!rules.length) {

                    category.hidden =
                        query !== "";

                    return;
                }


                const hasVisibleRules =
                    rules.some(
                        rule =>
                            !rule.hidden
                    );


                category.hidden =
                    !hasVisibleRules;
            });


            if (noResults) {

                noResults.hidden =
                    visibleRuleCount !== 0 ||
                    query === "";
            }
        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                updateRuleSearch
            );


            searchInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        searchInput.value = "";

                        updateRuleSearch();

                        searchInput.blur();
                    }
                }
            );
        }


        /*
         * Keep only one rule open in each
         * category at a time.
         */

        ruleItems.forEach(rule => {

            rule.addEventListener(
                "toggle",
                () => {

                    if (!rule.open) {
                        return;
                    }

                    const category =
                        rule.closest(
                            "[data-rule-category]"
                        );

                    if (!category) {
                        return;
                    }

                    category
                        .querySelectorAll(
                            "[data-rule-item]"
                        )
                        .forEach(otherRule => {

                            if (
                                otherRule !== rule &&
                                otherRule.open
                            ) {

                                otherRule.open = false;
                            }
                        });
                }
            );
        });


        /*
         * Smooth navigation from the
         * section menu.
         */

        document
            .querySelectorAll(
                ".rules-navigation a"
            )
            .forEach(link => {

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


                        const navbarHeight =
                            96;

                        const top =
                            target
                                .getBoundingClientRect()
                                .top +
                            window.scrollY -
                            navbarHeight;


                        window.scrollTo({
                            top,
                            behavior: "smooth"
                        });
                    }
                );
            });


        updateRuleSearch();
    }
);