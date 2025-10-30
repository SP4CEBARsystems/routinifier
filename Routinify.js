import { PomodoroTimer } from "./PomodoroTimer.js";
import { Templates } from "./Templates.js";
import { TextFileHandler } from "./TextFileHandler.js";
import { TodoList } from "./TodoList.js";

export default class Routinify {
    /** @type {Routinify} */
    static instance;

    static version = 1;

    constructor() {
        if (!Routinify.instance) Routinify.instance = this;
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

    getExportObject() {
        return {
            version: this.version,
            tasks: this.todo.getExportObject(),
        };
    }

    getJson() {
        return JSON.stringify(this.getExportObject());
    }

    /** Save to localStorage */
    save() {
        const jsonTaskList = this.getJson();
        localStorage.setItem('todoTasks', jsonTaskList);
    }
    
    /** Save to file download */
    saveFile() {
        const jsonTaskList = this.getJson();
        TextFileHandler.download(jsonTaskList, `routinify-tasks-v${Routinify.version}.json`);
    }

    /** Load from localStorage */
    load() {
        this.setJson(localStorage.getItem('todoTasks'));
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
        const tasks = data.tasks;
        // VersionNumber.checkVersion(tasks.version);
        // if (tasks.version >= Routinify.version) {
        //     window.alert(`loading an old file`);
        // }
        this.todo.setTasks(tasks);
    }
}