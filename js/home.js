/* ==========================================================
   UNION ROLEPLAY HOMEPAGE
========================================================== */

const UNION_RELEASE_DATE =
    new Date(
        "2026-09-18T18:00:00+01:00"
    );


function padCountdown(value) {

    return String(
        Math.max(
            0,
            value
        )
    ).padStart(
        2,
        "0"
    );
}


function updateCountdownValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    const nextValue =
        padCountdown(
            value
        );


    if (
        element.textContent ===
        nextValue
    ) {
        return;
    }


    element.classList.add(
        "countdown-tick"
    );


    setTimeout(
        () => {

            element.textContent =
                nextValue;

            element.classList.remove(
                "countdown-tick"
            );

        },
        80
    );
}


function updateReleaseCountdown() {

    const now =
        Date.now();


    const difference =
        UNION_RELEASE_DATE.getTime() -
        now;


    const countdown =
        document.getElementById(
            "releaseCountdown"
        );


    if (!countdown) {
        return;
    }


    if (difference <= 0) {

        countdown.innerHTML = `
            <div class="hero-countdown-live">
                UNION ROLEPLAY IS NOW LIVE
            </div>
        `;

        return;
    }


    const totalSeconds =
        Math.floor(
            difference /
            1000
        );


    const days =
        Math.floor(
            totalSeconds /
            86400
        );


    const hours =
        Math.floor(
            (
                totalSeconds %
                86400
            ) /
            3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            ) /
            60
        );


    const seconds =
        totalSeconds %
        60;


    updateCountdownValue(
        "countdownDays",
        days
    );

    updateCountdownValue(
        "countdownHours",
        hours
    );

    updateCountdownValue(
        "countdownMinutes",
        minutes
    );

    updateCountdownValue(
        "countdownSeconds",
        seconds
    );
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateReleaseCountdown();

        setInterval(
            updateReleaseCountdown,
            1000
        );

    }
);