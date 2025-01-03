let remainingTime;
let timerInterval;

self.onmessage = function (e) {
    const { command, time } = e.data;

    if (command === 'start') {
        remainingTime = time;

        timerInterval = setInterval(() => {
            remainingTime -= 1;
            self.postMessage({ command: 'update', remainingTime });

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                self.postMessage({ command: 'finished' });
            }
        }, 1000);
    } else if (command === 'stop') {
        clearInterval(timerInterval);
        self.postMessage({ command: 'stopped' });
    }
};
