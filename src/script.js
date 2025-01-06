let eggType = '';
let eggConsistency = '';
let eggSize = 'medium';
let altitude = 0;

const content = document.getElementById('content');
const alarmSound = new Audio('alarm.wav');
alarmSound.loop = true;

function calculateEggBoilingTimeInSeconds(size, startTemp, desiredConsistency, altitude = 0) {

    const timetable = {

        small: {
            soft: 240,
            medium: 300,
            hard: 360
        },
        medium: {
            soft: 300,
            medium: 360,
            hard: 420
        },
        large: {
            soft: 360,
            medium: 420,
            hard: 480
        },
        extraLarge: {
            soft: 420,
            medium: 480,
            hard: 540
        }
    }
    // Validate egg size
    const baseTime = timetable[size.toLowerCase()][desiredConsistency.toLowerCase()];

    // Adjust base time based on starting temperature
    const tempAdjustment = (20 - startTemp) * 2; // ~2 seconds per degree difference from 20°C

    // Adjust for altitude
    const altitudeAdjustment = altitude * 0.005; // ~0.005 seconds per meter altitude

    // Calculate total time in seconds
    const boilingTimeInSeconds = Math.round(
        (baseTime * consistencyMultiplier) + tempAdjustment + altitudeAdjustment
    );

    return boilingTimeInSeconds;
}

function getDeviceAltitude() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const altitude = position.coords.altitude; // Altitude in meters
                if (altitude !== null && altitude !== undefined) {
                    resolve(altitude);
                } else {
                    reject("Altitude data is not available from this device.");
                }
            },
            (error) => {
                reject(`Error getting location: ${error.message}`);
            },
            { enableHighAccuracy: true } // Request more accurate readings if possible
        );
    });
}

function setEggSize(size) {
    if (size === undefined) {
        content.innerHTML = `
        <p>Wat is het formaat van het ei? bij twijfel kies Middelgroot.</p>
        <button onclick="setEggSize('small')">Kleine eieren</button>
        <button onclick="setEggSize('medium')">Middelgrote eieren</button>
        <button onclick="setEggSize('large')">Grote eieren</button>
        <button onclick="setEggSize('extraLarge')">Extra grote eieren</button>
        `;
    }
    else {
        eggSize = size;
        prepareForBoiling();
    }

}

function prepareForBoiling() {
    content.innerHTML = `
    <p>Zet een pan water op het gasfornuis en voeg een beetje zout toe.</p>
    <button onclick="askWaterBoiling()">Het water kookt nog niet</button>
    <button onclick="askWaterBoiling(true)">Het water kookt</button>
  `;
}

function askWaterBoiling(isBoiling = false) {
    if (!isBoiling) {
        showOverlay();
    } else {
        content.innerHTML = `
      <p>Doe de eieren in de pan en start de timer.</p>
      <button onclick="startTimer()">Start Timer</button>
    `;
    }
}

function startTimer() {
    const time = calculateEggBoilingTimeInSeconds(eggSize, 20, eggConsistency, altitude);
    let remainingTime = time;

    content.innerHTML = `
    <p>Timer loopt... Tijd over:</p>
    <h2 id="timer-display"></h2>
  `;

    const timerDisplay = document.getElementById('timer-display');

    // Update de timer elke seconde
    const timerInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (remainingTime === 0) {
            clearInterval(timerInterval);
            showFinishedOverlay(); // Toon de overlay wanneer de timer verloopt
        }

        remainingTime -= 1;
    }, 1000);
}

function showFinishedOverlay() {
    // Laat het geluid spelen en apparaat trillen
    alarmSound.play();
    if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500]); // Trillingspatroon
    }

    // Dynamische tekst invoegen
    const overlay = document.getElementById('finished-overlay');
    const overlayContent = document.getElementById('overlay-message');
    overlayContent.innerHTML = `Geniet van je heerlijke ${eggType === 'hard' ? 'hardgekookte' : 'zachtgekookte'} eieren!`;

    // Toon de overlay
    overlay.classList.remove('hidden');
}

function closeFinishedOverlay() {
    // Stop het geluid en het trillen
    alarmSound.pause();
    alarmSound.currentTime = 0; // Reset het geluid
    if ("vibrate" in navigator) {
        navigator.vibrate(0); // Stop trillen
    }

    // Verberg de overlay
    const overlay = document.getElementById('finished-overlay');
    overlay.classList.add('hidden');
    content.innerHTML = `<p>Geniet van je ${eggType === 'hard' ? 'hardgekookte' : 'zachtgekookte'} eieren!</p>`;
    const restartButton = document.createElement('button');
    restartButton.textContent = "Ik wil meer eieren";
    restartButton.onclick = restartApp;
    restartButton.id = "restart-button";
    content.appendChild(restartButton);
}

function showOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
}

function closeOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.add('hidden');
}

function setEggConsistency(consistency) {
    //check if consistency is undefined
    if (consistency === undefined) {
        content.innerHTML = `
    <p>Hoe wil je je ei?</p>
    <button onclick="setEggConsistency('hard')">Hardgekookt</button>
    <button onclick="setEggConsistency('medium')">Met een zachte kern</button>
    <button onclick="setEggConsistency('soft')">Zachtgekookt</button>
  `;
    } else {
        eggConsistency = consistency;
        setEggSize();
    }
}

function confirmAltitude(confirmation) {
    //check if confirmation is undefined
    if (confirmation === undefined) {
        getDeviceAltitude().then((altitude) => {
            altitude = altitude;
            content.innerHTML = `
            <p>Je bent op een hoogte van ${altitude} meter ${altitude >= 0 ? 'boven' : 'onder'} zeeniveau. Is dit correct?</p>
            <button onclick="confirmAltitude(true)">Ja</button>
            <button onclick="confirmAltitude(false)">Nee</button>
            `;

        }).catch((error) => {
            altitude = 0;
            content.innerHTML = `
            <p>We kunnen via je apparaat niet bepalen op welke hoogte je bent. We gaan er vanuit dat je op zeeniveau bent.</p>
            <button onclick="confirmAltitude(true)">Ok</button>
            `;
        });
    }

    else if (confirmation) {
        setEggConsistency();
    } else {
        setEggConsistency();
    }
}


function restartApp() {
    confirmAltitude();
};

restartApp(); // Start de app
