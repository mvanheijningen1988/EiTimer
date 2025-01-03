let eggType = '';
const content = document.getElementById('content');
const logs = document.getElementById('logs');
const alarmSound = new Audio('alarm.wav'); // Voeg je alarmgeluid toe
alarmSound.loop = true; // Herhaal het geluid

function checkPermission() {
    if (!('serviceWorker' in navigator)) {
        throw new Error("No support for service worker!")
    }

    if (!('Notification' in window)) {
        throw new Error("No support for notification API");
    }

    if (!('PushManager' in window)) {
        throw new Error("No support for Push API")
    }
}

async function sw() {
    // Check if the browser supports Periodic Background Sync
    if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
        navigator.serviceWorker.register('sw.js').then(async (registration) => {
            console.log('Service Worker registered:', registration);

            const permission = await navigator.permissions.query({ name: 'periodic-background-sync' });
            if (permission.state === 'granted') {
                await registration.periodicSync.register('check-time', {
                    minInterval: 10 * 1000 // 1 minute
                });
                alert('Periodic Background Sync enabled!');
            } else {
                alert('Permission denied for Periodic Background Sync.');
            }

        });
    } else {
        console.warn('Periodic Background Sync is not supported in this browser.');
    }

}

function logMessage(message, type = 'info') {
    const logItem = document.createElement('li');
    logItem.textContent = message;
    logItem.className = type; // Voeg een class toe, bijvoorbeeld 'info', 'warn', of 'error'
    logs.appendChild(logItem);
}

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
    const time = eggType === 'hard' ? 10 * 60 : 8 * 60; // Tijd in seconden
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

checkPermission();
restartApp(); // Start de app
