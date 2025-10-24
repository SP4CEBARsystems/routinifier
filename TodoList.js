import { Task } from "./Task.js";

export class TodoList {
    static mainTodoList;

    /**
     * @type {Task[]}
     */
    tasks = [];

    /**
     * Creates a ToDo list instance.
     * @param {HTMLElement} listElement
     * @param {HTMLElement} checkedListElement
     */
    constructor(listElement, checkedListElement) {
        this.listElement = listElement;
        this.checkedListElement = checkedListElement;
        this.load();
        this.render();
    }

    /**
     * Add a task below
     * @param {string} text
     */
    addTask(text) {
        this.tasks.push(new Task( text, this ));
        // this.reorder();
        this.save();
        this.render();
    }

    /**
     * Add a task to the top
     * @param {string} text
     */
    addTaskAbove(text) {
        this.tasks.unshift(new Task( text, this ));
        this.save();
        this.render();
    }

    /** Delete a task by index 
     * @param taskId {string}
    */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(element => element.id === taskId);
        this.tasks.splice(taskIndex, 1);
        this.save();
        this.render();
    }

    /** Reorder tasks: unchecked on top */
    reorder() {
        this.tasks.sort((a, b) => a.checked - b.checked);
    }

    /** Save to localStorage */
    save() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    /** Load from localStorage */
    load() {
        const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        tasks.forEach(task => {
            this.addTask( task.text );
        });
    }

    /** Render the tasks */
    render() {
        const uncheckedTasks = this.tasks.filter(task => !task.checked);
        const checkedTasks = this.tasks.filter(task => task.checked);
        this.renderTaskList(this.listElement, uncheckedTasks);
        this.renderTaskList(this.checkedListElement, checkedTasks);
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {Task[]} tasks 
     */
    renderTaskList(element, tasks) {
        element.innerHTML = '';
        tasks.forEach(task => {
            const li = task.render();
            element.appendChild(li);
        });
    }

    /** Get top-most task text */
    getTopTask() {
        const top = this.tasks.find(t => !t.checked);
        return top ? top.text : '';
    }
}
