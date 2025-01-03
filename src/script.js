let eggType = '';
const content = document.getElementById('content');
const alarmSound = new Audio('alarm.wav'); // Voeg je alarmgeluid toe
alarmSound.loop = true; // Herhaal het geluid

function setEggPreference(type) {
    eggType = type;
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
    const time = eggType === 'hard' ? 10 * 60 : 0.1 * 60; // Tijd in seconden
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

function restartApp() {
    // Reset de inhoud naar de oorspronkelijke vraag
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.remove();
    }

    content.innerHTML = `
    <p>Hoe wil je je ei?</p>
    <button onclick="setEggPreference('hard')">Hardgekookt</button>
    <button onclick="setEggPreference('soft')">Zachtgekookt</button>
  `;
}

restartApp(); // Start de app
