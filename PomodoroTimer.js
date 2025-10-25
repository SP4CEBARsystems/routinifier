export class PomodoroTimer {
    /** @typedef {"Work"|"Short Break"|"Long Break"} PomodoroPhaseName */
    /** @typedef {{name: PomodoroPhaseName, duration: number}} PomodoroPhase */
    /** @typedef {{WORK: PomodoroPhase, SHORT_BREAK: PomodoroPhase, LONG_BREAK: PomodoroPhase}} Phases */
    /** @type {Phases} */
    static PHASES = {
        // WORK: { name: 'Work', duration: 25 },
        // SHORT_BREAK: { name: 'Short Break', duration: 5 },
        // LONG_BREAK: { name: 'Long Break', duration: 15 }
        WORK: { name: 'Work', duration: 25/(60*5) },
        SHORT_BREAK: { name: 'Short Break', duration: 5/(60*5) },
        LONG_BREAK: { name: 'Long Break', duration: 15/(60*5) }
    };
    
    /** @type {HTMLCanvasElement} */
    canvas
    
    /** @type {CanvasRenderingContext2D} */
    ctx
    
    /** @type {Function|null} */
    onTick
    
    /** @type {Function|null} */
    onPhaseEnd
    
    /** @type {number|null} */
    interval

    /** @type {PomodoroPhase} */
    currentPhase;
    
    /** @type {number} */
    duration
    
    /** @type {number} */
    remaining
    
    /** @type {number} */
    workSessionCount
    
    /** @type {HTMLAudioElement} */
    workAlarmSound
    
    /** @type {HTMLAudioElement} */
    breakAlarmSound

    /**
     * Creates a Pomodoro timer instance.
     * @param {HTMLCanvasElement} canvas
     * @param {Function|null} onTick Callback every second
     * @param {Function|null} onPhaseEnd Callback when phase ends
     */
    constructor(canvas, onTick = null, onPhaseEnd = null) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('no ctx');
        }
        this.ctx = ctx;
        this.onTick = onTick;
        this.onPhaseEnd = onPhaseEnd;
        this.interval = null;
        this.currentPhase = PomodoroTimer.PHASES.WORK;
        this.duration = this.currentPhase.duration * 60;
        this.remaining = this.duration;
        this.canvas.closest('.timer-container')?.classList.add('paused');
        this.workSessionCount = 0;
        this.workAlarmSound = new Audio('./audio/plannedout_work.wav'); // Placeholder path
        this.breakAlarmSound = new Audio('./audio/plannedout_break.wav'); // Placeholder path
    }

    /** Get next phase based on Pomodoro technique rules */
    getNextPhase() {
        if (this.currentPhase === PomodoroTimer.PHASES.WORK) {
            this.workSessionCount++;
            // After 4 work sessions, take a long break
            if (this.workSessionCount >= 4) {
                this.workSessionCount = 0;
                return PomodoroTimer.PHASES.LONG_BREAK;
            }
            return PomodoroTimer.PHASES.SHORT_BREAK;
        }
        // After any break, return to work
        return PomodoroTimer.PHASES.WORK;
    }

    /** Handle timer completion */
    handleTimerComplete() {
        if (this.onPhaseEnd) this.onPhaseEnd(this.currentPhase);
        // Switch to next phase
        const nextPhase = this.getNextPhase();
        if (nextPhase.name == 'Work') {
            this.workAlarmSound.play();
        } else {
            this.breakAlarmSound.play();
        }
        this.switchPhase(nextPhase);
    }

    /** Start the timer */
    start() {
        if (this.interval) return;
        this.canvas.closest('.timer-container')?.classList.remove('paused');
        // Immediately update display
        this.draw();
        if (this.onTick) this.onTick(this.remaining);
        
        this.interval = setInterval(() => {
            this.remaining--;
            if (this.remaining <= 0) {
                // this.stop();
                this.handleTimerComplete();
            } else {
                this.draw();
                if (this.onTick) this.onTick(this.remaining);
            }
        }, 1000);
    }

    /** Stop the timer */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.canvas.closest('.timer-container')?.classList.add('paused');
            // Immediately update display
            this.draw();
            if (this.onTick) this.onTick(this.remaining);
        }
    }

    /**
     *  Function to toggle timer state 
    */
    toggle() {
        if (this.isRunning()) {
            this.stop();
        } else {
            this.start();
        }
    }

    /** Reset timer */
    reset() {
        this.remaining = this.duration;
        this.draw();
    }

    /** Switch to a specific phase 
     * @param {PomodoroPhase} phase
    */
    switchPhase(phase) {
        const wasRunning = this.isRunning();
        if (wasRunning) this.stop();
        
        this.currentPhase = phase;
        this.duration = this.currentPhase.duration * 60;
        this.remaining = this.duration;
        // Immediately update display
        this.draw();
        if (this.onTick) this.onTick(this.remaining);
        
        if (wasRunning) this.start();
    }

    /** Get current phase */
    getCurrentPhase() {
        return this.currentPhase;
    }

    /** 
     * Check if timer is running 
     * @returns {boolean} true if an interval is defined, false otherwise
    */
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

    /** Format time as mm:ss 
     * @param {number} seconds 
    */
    static formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}

