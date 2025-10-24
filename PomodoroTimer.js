export class PomodoroTimer {
    static PHASES = {
        WORK: { name: 'Work', duration: 25 },
        SHORT_BREAK: { name: 'Short Break', duration: 5 },
        LONG_BREAK: { name: 'Long Break', duration: 15 }
    };

    /**
     * Creates a Pomodoro timer instance.
     * @param {HTMLCanvasElement} canvas
     * @param {Function} onTick Callback every second
     * @param {Function} onPhaseEnd Callback when phase ends
     */
    constructor(canvas, onTick = null, onPhaseEnd = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onTick = onTick;
        this.onPhaseEnd = onPhaseEnd;
        this.interval = null;
        this.currentPhase = PomodoroTimer.PHASES.WORK;
        this.duration = this.currentPhase.duration * 60;
        this.remaining = this.duration;
        this.canvas.closest('.timer-container').classList.add('paused');
    }

    /** Start the timer */
    start() {
        if (this.interval) return;
        this.canvas.closest('.timer-container').classList.remove('paused');
        this.interval = setInterval(() => {
            this.remaining--;
            if (this.remaining <= 0) this.stop();
            this.draw();
            if (this.onTick) this.onTick(this.remaining);
        }, 1000);
    }

    /** Stop the timer */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.canvas.closest('.timer-container').classList.add('paused');
        }
    }

    /** Reset timer */
    reset() {
        this.remaining = this.duration;
        this.draw();
    }

    /** Switch to a specific phase */
    switchPhase(phase) {
        const wasRunning = this.isRunning();
        if (wasRunning) this.stop();
        
        this.currentPhase = phase;
        this.duration = this.currentPhase.duration * 60;
        this.remaining = this.duration;
        this.draw();
        
        if (wasRunning) this.start();
    }

    /** Get current phase */
    getCurrentPhase() {
        return this.currentPhase;
    }

    /** Check if timer is running */
    isRunning() {
        return this.interval !== null;
    }

    /** Draw shrinking pie */
    draw() {
        const ctx = this.ctx;
        const radius = this.canvas.width / 2 - 10;
        const angle = (this.remaining / this.duration) * 2 * Math.PI;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background circle
        ctx.beginPath();
        ctx.arc(this.canvas.width / 2, this.canvas.height / 2, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ddd';
        ctx.fill();

        // Timer arc
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2);
        ctx.arc(this.canvas.width / 2, this.canvas.height / 2, radius, -Math.PI / 2, -Math.PI / 2 + angle, false);
        ctx.closePath();
        ctx.fillStyle = '#ff6347';
        ctx.fill();
    }

    /** Format time as mm:ss */
    static formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
