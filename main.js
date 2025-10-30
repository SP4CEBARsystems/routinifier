import { PomodoroTimer } from './PomodoroTimer.js';
import { TodoList } from './TodoList.js';
import { Templates } from './Templates.js';

document.addEventListener('DOMContentLoaded', main);

function main() {
    const canvas = document.getElementById('pomodoroCanvas');
    const timeDisplay = document.getElementById('timeDisplay');
    const todoListEl = document.getElementById('todoList');
    const checkedTodoListEl = document.getElementById('checkedTodoList');
    const newTaskInput = document.getElementById('newTaskInput');
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

    const timer = new PomodoroTimer(canvas, (remaining) => {
        timeDisplay.textContent = PomodoroTimer.formatTime(remaining);
        const topTask = todo.getTopTaskText();
        // currentTaskEl.textContent = topTask;
        todo.renderFirstTaskSummary(currentTaskEl);
        document.title = `${PomodoroTimer.formatTime(remaining)} - ${topTask}`;
    });

    const todo = new TodoList(todoListEl, checkedTodoListEl);
    TodoList.mainTodoList = todo;
    const templates = new Templates(todo);

    console.log(todo.tasks);
    if (todo.tasks.length == 0) {
        templates.addTemplate('work');
    }

    addTaskBtn.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text) {
            todo.addTask(text);
            newTaskInput.value = '';
        }
    });

    newTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTaskBtn.click();
    });

    // currentTaskEl.addEventListener('click', () => {
    //     todo.checkTopTask();
    //     todo.renderFirstTaskSummary(currentTaskEl);
    //     // currentTaskEl.textContent = todo.getTopTask();
    //     // todo.render();
    //     todo.save();
    // });

    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => templates.addTemplate(btn.dataset.template));
    });

    timer.draw();

    // Add click event listeners to both canvas and time display
    const toggle = timer.toggle.bind(timer);
    canvas.addEventListener('click', toggle);
    timeDisplay.addEventListener('click', toggle);

    // Setup phase button handlers
    function updatePhaseButtons(activePhase) {
        Object.entries(phaseButtons).forEach(([phase, button]) => {
            button.classList.toggle('active', phase === activePhase);
        });
    }

    phaseButtons.work.addEventListener('click', () => {
        timer.switchPhase(PomodoroTimer.PHASES.WORK);
        updatePhaseButtons('work');
    });

    phaseButtons.shortBreak.addEventListener('click', () => {
        timer.switchPhase(PomodoroTimer.PHASES.SHORT_BREAK);
        updatePhaseButtons('shortBreak');
    });

    phaseButtons.longBreak.addEventListener('click', () => {
        timer.switchPhase(PomodoroTimer.PHASES.LONG_BREAK);
        updatePhaseButtons('longBreak');
    });

    // Download example
    document.getElementById('downloadTextBtn').addEventListener('click', todo.saveFile.bind(todo));

    // Upload example
    document.getElementById('textInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await todo.loadFile(file);
            } catch (err) {
                console.error(err.message);
            }
        }
    });
}