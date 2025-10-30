import { PomodoroTimer } from "./PomodoroTimer.js";
import { Templates } from "./Templates.js";
import { TextFileHandler } from "./TextFileHandler.js";
import { TodoList } from "./TodoList.js";

export default class Routinify {
    /** @type {Routinify} */
    static instance;

    static version = 1;

    /**
     * @type {number}
     */
    lastExitTimeStamp;

    /**
     * @type {number}
     */
    lastLoadTimeStamp;

    constructor() {
        this.lastExitTimeStamp = parseInt(localStorage.getItem('lastExitTime') ?? '');
        this.lastLoadTimeStamp = Date.now();
        window.addEventListener('beforeunload', this.saveExitTimeToLocalStorage.bind(this));
        if (!Routinify.instance) Routinify.instance = this;
        // Ensure last save time is written before the page unloads
        this.version = Routinify.version;
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('pomodoroCanvas'));
        const timeDisplay = document.getElementById('timeDisplay');
        const todoListEl = document.getElementById('todoList');
        const checkedTodoListEl = document.getElementById('checkedTodoList');
        const newTaskInput = /** @type {HTMLInputElement} */ (document.getElementById('newTaskInput'));
        const addTaskBtn = document.getElementById('addTaskBtn');
        const phaseButtons = {
            work: document.getElementById('workPhase'),
            shortBreak: document.getElementById('shortBreakPhase'),
            longBreak: document.getElementById('longBreakPhase')
        };
        const currentTaskEl = document.getElementById('currentTask');
        if (!currentTaskEl) {
            throw new Error('no currentTaskEl!')
        }
        TodoList.firstTaskSummary = currentTaskEl;

        this.sessionFocusElement = document.getElementById('sessionFocus');
        this.sessionFocusElement?.addEventListener('change', this.saveSessionFocus.bind(this));

        const todo = new TodoList(todoListEl, checkedTodoListEl);
        this.todo = todo;
        TodoList.mainTodoList = todo;
        const templates = new Templates(todo);
        this.templates = templates;

        const timer = new PomodoroTimer(canvas, (remaining) => {
            timeDisplay.textContent = PomodoroTimer.formatTime(remaining);
            const topTask = todo.getTopTaskText();
            // currentTaskEl.textContent = topTask;
            todo.renderFirstTaskSummary(currentTaskEl);
            document.title = `${PomodoroTimer.formatTime(remaining)} - ${topTask}`;
        }, (nextPhase) => {
            switch (nextPhase) {
                case 'Work':
                    templates.removeTemplate('break');
                    break;
                case 'Short Break':
                case 'Long Break':
                    templates.addTemplate('break');
                    break;
            }
        });
        this.timer = timer;

        this.load();
        this.loadRoutineIfLongAgo('work');

        console.log(todo.tasks);
        if (todo.tasks.length == 0) {
            templates.addTemplate('work');
        }

        addTaskBtn?.addEventListener('click', () => {
            const text = newTaskInput?.value?.trim();
            if (text) {
                todo.addTask(text);
                newTaskInput.value = '';
            }
        });

        newTaskInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addTaskBtn.click();
        });

        // currentTaskEl?.addEventListener('click', () => {
        //     todo.checkTopTask();
        //     todo.renderFirstTaskSummary(currentTaskEl);
        //     // currentTaskEl.textContent = todo.getTopTask();
        //     // todo.render();
        //     todo.save();
        // });

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn?.addEventListener('click', () => templates.addTemplate(btn.dataset.template));
        });

        timer.draw();

        // Add click event listeners to both canvas and time display
        const toggle = timer.toggle.bind(timer);
        canvas?.addEventListener('click', toggle);
        timeDisplay?.addEventListener('click', toggle);

        // Setup phase button handlers
        function updatePhaseButtons(activePhase) {
            Object.entries(phaseButtons).forEach(([phase, button]) => {
                button?.classList.toggle('active', phase === activePhase);
            });
        }

        phaseButtons.work?.addEventListener('click', () => {
            timer.switchPhase(PomodoroTimer.PHASES.WORK);
            updatePhaseButtons('work');
        });

        phaseButtons.shortBreak?.addEventListener('click', () => {
            timer.switchPhase(PomodoroTimer.PHASES.SHORT_BREAK);
            updatePhaseButtons('shortBreak');
        });

        phaseButtons.longBreak?.addEventListener('click', () => {
            timer.switchPhase(PomodoroTimer.PHASES.LONG_BREAK);
            updatePhaseButtons('longBreak');
        });

        // Download example
        document.getElementById('downloadTextBtn')?.addEventListener('click', this.saveFile.bind(this));

        // Upload example
        document.getElementById('textInput')?.addEventListener('change', async (event) => {
            const file = event?.target?.files[0];
            if (file) {
                try {
                    await this.loadFile(file);
                } catch (err) {
                    console.error(err.message);
                }
            }
        });
    }

    /**
     * @param {InputEvent} event 
     */
    saveSessionFocus(event) {
        const input = /** @type {HTMLInputElement} */ (event.currentTarget);
        localStorage.setItem('sessionFocus', input?.value ?? '');
    }

    /**
     * 
     * @typedef {{version: number, lastSaveTime: number, focus: string, tasks: any[]}} RoutinifierExport
     * @returns {RoutinifierExport}
     */
    getExportObject() {
        return {
            version: this.version,
            lastSaveTime: Date.now(),
            focus: this.getSessionFocus(),
            tasks: this.todo.getExportObject(),
        };
    }

    getJson() {
        return JSON.stringify(this.getExportObject());
    }

    /** Save to localStorage */
    save() {
        localStorage.setItem('todoTasks', this.getJson());
    }
    
    saveExitTimeToLocalStorage() {
        localStorage.setItem('lastExitTime', `${Date.now()}`);
    }

    /** Save to file download */
    saveFile() {
        const jsonTaskList = this.getJson();
        TextFileHandler.download(jsonTaskList, `routinify-tasks-v${Routinify.version}.json`);
    }

    /** Load from localStorage */
    load() {
        this.setJson(localStorage.getItem('todoTasks'));
        const loadedSessionFocus = localStorage.getItem('sessionFocus');
        this.setSessionFocus(loadedSessionFocus);
    }

    /**
     * 
     * @param {string|null} loadedSessionFocus 
     */
    setSessionFocus(loadedSessionFocus) {
        if (loadedSessionFocus) this.sessionFocusElement.value = loadedSessionFocus;
    }

    /**
     * 
     * @returns {string}
     */
    getSessionFocus() {
        return this.sessionFocusElement?.value ?? '';
    }

    /** Load from file upload 
     * @param {File} file 
    */
    async loadFile(file) {
        const json = await TextFileHandler.upload(file);
        console.log('File contents:\n', json);
        this.setJson(json);
    }
    
    /**
     * 
     * @param {string} json 
    */
    setJson(json) {
        const data = TodoList.isDefined(json) ? JSON.parse(json) ?? [] : [];
        // VersionNumber.checkVersion(tasks.version);
        // if (tasks.version >= Routinify.version) {
        //     window.alert(`loading an old file`);
        // }
        this.setObject(data);
    }

    /**
     * 
     * @param {RoutinifierExport} data 
     */
    setObject(data) {
        this.setSessionFocus(data.focus);
        this.todo.setTasks(data.tasks);
    }

    getTimeSinceLastExit() {
        return Date.now() - this.lastExitTimeStamp;
    }

    getTimeSinceLastLoad() {
        return Date.now() - this.lastLoadTimeStamp;
    }

    getTimeUnloaded() {
        return this.lastLoadTimeStamp - this.lastExitTimeStamp;
    }

    /**
     * Load the specified routine if the site was closed for longer than the threshold
     * @param {string} routineName the name of the routine to load
     * @param {number} [threshold = 60] the time in minutes the site has to be closed for for the routine to load
     */
    loadRoutineIfLongAgo(routineName, threshold = 60) {
        const minutes = 60000;
        const thresholdMiliseconds = threshold * minutes;
        if (this.getTimeSinceLastExit() > thresholdMiliseconds) {
            this.templates.addUniqueTemplate(routineName);
        }
    }
}