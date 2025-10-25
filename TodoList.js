import { Task } from "./Task.js";

export class TodoList {
    /** @type {TodoList} */
    static mainTodoList;

    /** @type {HTMLElement} */
    static firstTaskSummary;

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
     * @param {number} [indentationLevel] 
     */
    addTask(text, isChecked, indentationLevel) {
        this.tasks.push(new Task( text, isChecked, indentationLevel ));
        // this.reorder();
        this.save();
        this.render();
    }

    /**
     * Add a task to the top
     * @param {string} text
     * @param {boolean} [isChecked] 
     * @param {number} [indentationLevel] 
     */
    addTaskAbove(text, isChecked, indentationLevel) {
        this.tasks.unshift(new Task( text, isChecked, indentationLevel  ));
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
            this.addTask( task.text, task.checked, task.indentationLevel );
        });
    }

    /** Render the tasks */
    render() {
        this.renderFiltered(this.listElement, task => !task.checked);
        this.renderFiltered(this.checkedListElement, task => task.checked);
        this.renderFirstTaskSummary(TodoList.firstTaskSummary);
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
     * @param {HTMLElement} element 
     */
    renderFirstTaskSummary(element) {
        this.renderTaskList(element, this.getFirstTaskSummary());
    }

    getFirstTaskSummary() {
        let requiredIndentation = 0;
        const topmostTasks = this.tasks.filter(t => {
            if (t.checked) return false;
            if (t.indentationLevel < requiredIndentation) return false;
            requiredIndentation = t.indentationLevel + 1;
            return true;
        });
        return topmostTasks;
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
    getTopTaskText() {
        return this.getFirstTaskSummary().map(t => t.text).reverse().join(" - ");
        // const top = this.getFirstTask()?.text ?? '';
    }

    getFirstTask() {
        return this.tasks.find(t => !t.checked);
    }

    /** Get top-most task text */
    checkTopTask() {
        const top = this.tasks.find(t => !t.checked);
        if (!top) return;
        top.checked = true;
    }
}
