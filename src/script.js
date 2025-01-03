let eggType = '';
let timerWorker;
const content = document.getElementById('content');
const logs = document.getElementById('logs');
const alarmSound = new Audio('alarm.wav'); // Voeg je alarmgeluid toe
alarmSound.loop = true; // Herhaal het geluid

function logMessage(message, type = 'info') {
    const logItem = document.createElement('li');
    logItem.textContent = message;
    logItem.className = type; // Voeg een class toe, bijvoorbeeld 'info', 'warn', of 'error'
    logs.appendChild(logItem);
}

function setEggPreference(type) {
    logMessage(`Ei voorkeur: ${type}`, 'debug');
    eggType = type;
    content.innerHTML = `
    <p>Zet een pan water op het gasfornuis en voeg een beetje zout toe.</p>
    <button onclick="askWaterBoiling()">Het water kookt nog niet</button>
    <button onclick="askWaterBoiling(true)">Het water kookt</button>
  `;
}

function askWaterBoiling(isBoiling = false) {
    logMessage(`Is het water aan het koken? ${isBoiling}`, 'debug');
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
    logMessage(`Timer gestart voor ${eggType === 'hard' ? 'hardgekookt' : 'zachtgekookt'} ei`, 'debug');

    const time = eggType === 'hard' ? 10 * 60 : 8 * 60; // Tijd in seconden

    content.innerHTML = `
    <p>Timer loopt... Tijd over:</p>
    <h2 id="timer-display"></h2>
  `;

    // Initialiseer de Web Worker
    logMessage('Initialiseer de Web Worker', 'debug');
    if (typeof Worker !== 'undefined') {
        logMessage('Web Workers worden ondersteund in deze browser.', 'debug');
        timerWorker = new Worker('timerWorker.js');
        logMessage('Web Worker gestart', 'debug');
        timerWorker.postMessage({ command: 'start', time });

        logMessage('Web Worker luistert naar berichten...', 'debug');
        timerWorker.onmessage = function (e) {
            logMessage(`Bericht ontvangen: ${JSON.stringify(e.data)}`, 'debug');
            const { command, remainingTime } = e.data;

            if (command === 'update') {
                updateTimerDisplay(remainingTime);
            } else if (command === 'finished') {
                showFinishedOverlay();
                timerWorker.terminate();
            }
        };
    } else {
        logMessage('Web Workers worden niet ondersteund in deze browser.', 'error');
        console.error('Web Workers worden niet ondersteund in deze browser.');
    }
}

function updateTimerDisplay(remainingTime) {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showFinishedOverlay() {
    // Laat het geluid spelen en apparaat trillen
    logMessage('Timer afgelopen!', 'info');
    logMessage('Speel alarmgeluid af en laat apparaat trillen', 'debug');
    alarmSound.play();
    if ("vibrate" in navigator) {
        logMessage('Tril het apparaat', 'debug');
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
    logMessage('Sluit de overlay', 'info');
    logMessage('Stop het alarmgeluid en reset het geluid', 'debug');
    alarmSound.pause();
    alarmSound.currentTime = 0; // Reset het geluid
    if ("vibrate" in navigator) {
        logMessage('Stop het trillen', 'debug');
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

// if parameter debug is provided in the URL, show logs
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('debug')) {
    logs.classList.remove('hidden');
}

restartApp(); // Start de app
