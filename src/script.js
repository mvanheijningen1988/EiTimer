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

async function startTimer() {
    const duration = eggType === 'hard' ? 10 * 60 : 8 * 60; // Tijd in seconden
    const endTime = Date.now() + duration * 1000;

    // Sla timergegevens op in de cache
    await saveTimerDataToCache({ endTime, eggType });

    // Registreer Background Sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register('eggquadis-timer').then(() => {
                console.log('Timer geregistreerd voor background sync');
            });
        });
    } else {
        console.warn('Background Sync wordt niet ondersteund.');
        runTimerLocally(duration);
    }
}

async function saveTimerDataToCache(timerData) {
    const cache = await caches.open('egg-timer-cache');
    const response = new Response(JSON.stringify(timerData));
    await cache.put('/timer', response);
}

function runTimerLocally(duration) {
    let remainingTime = duration;

    content.innerHTML = `
    <p>Timer loopt... Tijd over:</p>
    <h2 id="timer-display"></h2>
  `;

    const timerDisplay = document.getElementById('timer-display');

    const timerInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            showFinishedOverlay();
        }

        remainingTime -= 1;
    }, 1000);
}

function showFinishedOverlay() {
    // Laat het geluid spelen en apparaat trillen
    alarmSound.play();
    if ('vibrate' in navigator) {
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
    if ('vibrate' in navigator) {
        navigator.vibrate(0); // Stop trillen
    }

    // Verberg de overlay
    const overlay = document.getElementById('finished-overlay');
    overlay.classList.add('hidden');
    content.innerHTML = `<p>Geniet van je ${eggType === 'hard' ? 'hardgekookte' : 'zachtgekookte'} eieren!</p>`;
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Ik wil meer eieren';
    restartButton.onclick = restartApp;
    restartButton.id = 'restart-button';
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker geregistreerd!'))
        .catch((err) => console.error('Service Worker registratie mislukt:', err));
}

restartApp(); // Start de app
