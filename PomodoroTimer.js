/**
 * @file PomodoroTimer - A configurable Pomodoro technique timer that renders a shrinking pie
 * and manages work / short / long break phases.
 *
 * @typedef {'Work'|'Short Break'|'Long Break'} PomodoroPhaseName
 * @export
 *
 * @typedef {{ name: PomodoroPhaseName, duration: number }} PomodoroPhase
 * @export
 *
 * @typedef {{ WORK: PomodoroPhase, SHORT_BREAK: PomodoroPhase, LONG_BREAK: PomodoroPhase }} Phases
 * @export
 *
 * @class PomodoroTimer
 * @classdesc Timer that renders to an HTMLCanvasElement, tracks current phase, duration and remaining time,
 * handles phase transitions following the Pomodoro technique (after 4 work sessions → long break),
 * and exposes controls for start, stop, toggle, reset, and switching phases. Optional callbacks can be
 * provided for per-second ticks and when a phase ends.
 *
 * @param {HTMLCanvasElement} canvas - Canvas element used to draw the circular countdown.
 * @param {((timeRemaining: number) => void) | null} [onTick=null] - Optional callback invoked every second with remaining seconds.
 * @param {((phase: PomodoroPhaseName) => void) | null} [onPhaseEnd=null] - Optional callback invoked when a phase completes with the phase name.
 *
 * @property {Phases} static PHASES - Default phase definitions available on the class (WORK, SHORT_BREAK, LONG_BREAK).
 * @property {HTMLCanvasElement} canvas - Canvas passed to the constructor.
 * @property {CanvasRenderingContext2D} ctx - 2D drawing context obtained from the canvas.
 * @property {((timeRemaining: number) => void) | null} onTick - Current onTick callback.
 * @property {((phase: PomodoroPhaseName) => void) | null} onPhaseEnd - Current onPhaseEnd callback.
 * @property {number | null} interval - Interval ID returned by setInterval when running, or null when stopped.
 * @property {PomodoroPhase} currentPhase - The active phase object.
 * @property {number} duration - Current phase duration in seconds.
 * @property {number} remaining - Remaining seconds in the current phase.
 * @property {number} workSessionCount - Counter of completed work sessions used to determine long breaks.
 * @property {HTMLAudioElement} workAlarmSound - Sound played when entering work phase.
 * @property {HTMLAudioElement} breakAlarmSound - Sound played when entering break phases.
 *
 * @example
 * // Create and start a timer
 * const canvas = document.querySelector('canvas');
 * const timer = new PomodoroTimer(canvas,
 *   (remaining) => console.log(`Remaining: ${PomodoroTimer.formatTime(remaining)}`),
 *   (phaseName) => console.log(`Phase ended: ${phaseName}`)
 * );
 * timer.start();
 */
export class PomodoroTimer {
    /** @type {Phases} */
    static PHASES = {
        WORK: { name: 'Work', duration: 25 },
        SHORT_BREAK: { name: 'Short Break', duration: 5 },
        LONG_BREAK: { name: 'Long Break', duration: 15 }
        // WORK: { name: 'Work', duration: 25/(60*5) },
        // SHORT_BREAK: { name: 'Short Break', duration: 25/(60*5) },
        // LONG_BREAK: { name: 'Long Break', duration: 15/(60*5) }
    };
    
    /** @type {HTMLCanvasElement} */
    canvas
    
    /** @type {CanvasRenderingContext2D} */
    ctx
    
    /** @type { null | ((timeRemaining: number) => void) } */
    onTick
    
    /** @type { null | ((nextPhase: PomodoroPhaseName) => void) } */
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

    /** @type {(()=>void) | undefined} */
    _onStart;

    /** @type {(()=>void) | undefined} */
    _onStop;

    /**
     * Creates a Pomodoro timer instance.
     * @param {HTMLCanvasElement} canvas
     * @param { null | ((timeRemaining: number) => void) } onTick Callback every second
     * @param { null | ((nextPhase: PomodoroPhaseName) => void) } onPhaseEnd Callback when phase ends
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
        this.updateSummaryDisplay();
    }

    /**
     * 
     * @param {(()=>void) | undefined} value 
     */
    setOnStart(value) {
        this._onStart = value;
    }

    /**
     * 
     * @param {(()=>void) | undefined} value 
     */
    setOnStop(value) {
        this._onStop = value;
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
        const nextPhase = this.getNextPhase();
        if (this.onPhaseEnd) this.onPhaseEnd(nextPhase.name);
        if (nextPhase.name == 'Work') {
            this.workAlarmSound.play();
        } else {
            this.breakAlarmSound.play();
        }
        this.switchPhase(nextPhase);
        this.updateSummaryDisplay();
    }

    updateSummaryDisplay() {
        let display = '';
        if (!this.isRunning()) {
            display = 'timer paused';
        } else {
            switch (this.currentPhase.name) {
                case 'Work': display = `${PomodoroTimer.numberPrefix(this.workSessionCount)} work session`;
                    break;
                case 'Short Break': display = this.workSessionCount > 0 ? `${PomodoroTimer.numberPrefix(this.workSessionCount - 1)} break` : 'break';
                    break;
                case 'Long Break': display = `enjoy your long break!`;
                    break;
            }
        }
        document.getElementById('timerDetailSummary').textContent = display;
    }

    /**
     * 
     * @param {number} number 
     * @returns 
     */
    static numberPrefix(number) {
        const numberPrefixes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelveth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'nineteenth', 'twentieth'];
        return numberPrefixes[number] ?? `${number}th`;
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
        this.updateSummaryDisplay()
        if (this._onStart) this._onStart();
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
        this.updateSummaryDisplay()
        if (this._onStop) this._onStop();
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
        const center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        }
        const ctx = this.ctx;
        const radius = center.x - 10;
        const angle = (this.remaining / this.duration) * 2 * Math.PI;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background circle
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ddd';
        ctx.fill();

        // Timer arc
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, -Math.PI / 2, -Math.PI / 2 - angle, true);
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

