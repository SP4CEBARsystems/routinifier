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
     * @param {boolean} [isChecked] 
     */
    addTask(text, isChecked) {
        this.tasks.push(new Task( text, isChecked ));
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

    /** Move a task up in the list */
    moveTaskUp(taskId) {
        return this.moveTaskByOffset(taskId, -1);
    }

    /** Move a task down in the list */
    moveTaskDown(taskId) {
        return this.moveTaskByOffset(taskId, 1);
    }

    /**
     * Move a task by an offset (negative = up, positive = down).
     * @param {string} taskId
     * @param {number} offset
     * @returns {boolean} true if moved
     */
    moveTaskByOffset(taskId, offset) {
        const idx = this.tasks.findIndex(t => t.id === taskId);
        const newIdx = idx + offset;
        if (idx < 0 || newIdx < 0 || newIdx >= this.tasks.length) return false;
        [this.tasks[idx], this.tasks[newIdx]] = [this.tasks[newIdx], this.tasks[idx]];
        this.save();
        this.render();
        return true;
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
        /**
         * @type {Task[]}
         */
        const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        tasks.forEach(task => {
            this.addTask( task.text, task.checked);
        });
    }

    /** Render the tasks */
    render() {
        this.renderFiltered(this.listElement, task => !task.checked);
        this.renderFiltered(this.checkedListElement, task => task.checked);
    }
    
    /**
     * 
     * @param {HTMLElement} element the parent DOM element to render to
     * @param {(task:Task)=>boolean} predicate for Array.prototype.filter() on this.tasks
     */
    renderFiltered(element, predicate) {
        const checkedTasks = this.tasks.filter(predicate);
        this.renderTaskList(element, checkedTasks);
    }

    /**
     * 
     * @param {HTMLElement} element the parent DOM element to render to
     */
    renderAll(element) {
        this.renderTaskList(element, this.tasks);
    }

    /**
     * 
     * @param {HTMLElement} element the parent DOM element to render to
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

    /** Get top-most task text */
    checkTopTask() {
        const top = this.tasks.find(t => !t.checked);
        if (!top) return;
        top.checked = true;
    }
}
