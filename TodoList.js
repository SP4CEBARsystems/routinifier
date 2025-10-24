import { Task } from "./Task.js";

export class TodoList {
    /**
     * @typedef {{text: string, subtasks: any[], checked: boolean}[]} TaskList
     */
    tasks

    /**
     * Creates a ToDo list instance.
     * @param {HTMLElement} listElement
     * @param {HTMLElement} checkedListElement
     */
    constructor(listElement, checkedListElement) {
        this.listElement = listElement;
        this.checkedListElement = checkedListElement;
        this.tasks = this.load() || [];
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
        return JSON.parse(localStorage.getItem('todoTasks')) || [];
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
     * @param {TaskList} tasks 
     */
    renderTaskList(element, tasks) {
        element.innerHTML = '';
        tasks.forEach(task => {
            const li = this.createTaskElement(task);
            element.appendChild(li);
        });
    }

    /** Get top-most task text */
    getTopTask() {
        const top = this.tasks.find(t => !t.checked);
        return top ? top.text : '';
    }
}
