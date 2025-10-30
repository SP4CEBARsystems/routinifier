import Routinify from "./Routinify.js";
import { Task } from "./Task.js";
import { TextFileHandler } from "./TextFileHandler.js";
// import VersionNumber from "./VersionNumber.js";

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
    }

    /**
     * Add a task below
     * @param {string} text
     * @param {boolean} [isChecked] 
     * @param {number} [indentationLevel] 
     * @param {string} [type] 
     */
    addTask(text, isChecked, indentationLevel, type) {
        this.tasks.push(new Task( text, isChecked, indentationLevel, type ));
        // this.reorder();
        Routinify.instance.save();
        this.render();
    }

    /**
     * Add a task to the top
     * @param {string} text
     * @param {boolean} [isChecked] 
     * @param {number} [indentationLevel] 
     * @param {string} [type] 
     */
    addTaskAbove(text, isChecked, indentationLevel, type) {
        this.tasks.unshift(new Task( text, isChecked, indentationLevel, type ));
        Routinify.instance.save();
        this.render();
    }

    /**
     * 
     * @param {string} taskId 
     * @returns {number} found index
     */
    getTaskIndex(taskId) {
        return this.tasks.findIndex(element => element.id === taskId);
    }

    /** Delete a task by index 
     * @param taskId {string}
    */
    deleteTask(taskId) {
        const taskIndex = this.getTaskIndex(taskId);
        const task = this.tasks[taskIndex];
        const childCount = task.getChildCount(this.tasks);
        // console.log(this.tasks[taskIndex], this.tasks, 'children', children);
        // return;
        console.log('before this.tasks', this.tasks);
        if (childCount > 0) {
            if (!window.confirm(`Are you sure you want to delete the task named "${task.text}" with ${TodoList.pluralFix(childCount, 'subtask', 'subtasks')}`)) return;
        }
        this.tasks.splice(taskIndex, childCount + 1);
        console.log('after this.tasks', this.tasks);
        Routinify.instance.save();
        this.render();
    }

    /** Move a task up in the list 
     * @param {string} taskId 
    */
    moveTaskUp(taskId) {
        return this.moveTaskByOffset(taskId, -1);
    }

    /** Move a task down in the list 
     * @param {string} taskId 
    */
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
        const taskIndex = this.getTaskIndex(taskId);
        const task = this.tasks[taskIndex];
        const newTaskIndex = taskIndex + offset;
        // const childCount = task.getChildCount(this.tasks);
        // this.moveSubsection(this.tasks, taskIndex, childCount, newTaskIndex);
        // this.moveElement(this.tasks, from, to)
        this.swapElements(this.tasks, taskIndex, newTaskIndex);
        Routinify.instance.save();
        this.render();
        return true;
    }

    /**
     * 
     * @param {any[]} arr 
     * @param {number} index1 
     * @param {number} index2 
     */
    swapElements(arr, index1, index2 = index1 + 1) {
        if (index1 < 0 || index2 < 0 || index1 >= arr.length || index2 >= arr.length) return false;
        [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
        return true;
    }

    /**
     * Moves a single element in an array.
     * @param {any[]} arr - The array to modify
     * @param {number} from - Index of the element to move
     * @param {number} to - Index to move the element to
     * @returns {any[]} The modified array
     */
    moveElement(arr, from, to) {
        const [element] = arr.splice(from, 1); // remove the element
        arr.splice(to, 0, element);            // insert at new position
        return arr;
    }

    /**
     * Moves a section of an array to a new position.
     * @param {any[]} arr - The source array (modified in place)
     * @param {number} start - Start index of the section to move
     * @param {number} itemCount - End index (non-inclusive)
     * @param {number} toIndex - Index to insert the section at
     * @returns {any[]} The modified array
     */
    moveSubsection(arr, start, itemCount, toIndex) {
        const section = arr.splice(start, itemCount); // remove section
        // Adjust insertion point if it comes after removed section
        const insertAt = toIndex > start ? toIndex - itemCount : toIndex;
        arr.splice(insertAt, 0, ...section);
        return arr;
    }

    /** Reorder tasks: unchecked on top */
    reorder() {
        this.tasks.sort((a, b) => (a.checked ?1:0) - (b.checked ?1:0));
    }

    getExportObject() {
        return this.tasks.map(task => task.getExportObject());
    }

    /**
     * 
     * @param {Task[] | undefined} tasks
     */
    setTasks(tasks) {
        if (tasks === undefined) return;
        const isTaskListValuable = this.tasks.length > 0;
        if (isTaskListValuable) {
            if (!window.confirm('are you sure you want to replace your tasks with the tasks from the file?')) return;
        }
        this.clear();
        tasks.forEach(task => {
            this.addTask( task.text, task.checked, task.indentationLevel, task.type );
        });
        this.render();
    }

    clear() {
        this.tasks = [];
    }

    /** Render the tasks */
    render() {
        const uncheckedTasks = this.renderFiltered(this.listElement, task => !task.checked);
        const checkedTasks = this.renderFiltered(this.checkedListElement, task => task.checked);
        const summaryTasks = this.renderFirstTaskSummary(TodoList.firstTaskSummary);
        document.getElementById('taskDetailSummary').textContent = this.getTopTaskText();
        document.getElementById('moreTasksDetailSummary').textContent = `(${uncheckedTasks.length - summaryTasks.length})`;
        document.getElementById('CompletedtasksDetailSummary').textContent = `(${checkedTasks.length})`;
    }
    
    /**
     * 
     * @param {HTMLElement} element the parent DOM element to render to
     * @param {(task:Task)=>boolean} predicate for Array.prototype.filter() on this.tasks
     */
    renderFiltered(element, predicate) {
        const checkedTasks = this.tasks.filter(predicate);
        this.renderTaskList(element, checkedTasks);
        return checkedTasks;
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
        const firstTaskSummary = this.getFirstTaskSummary();
        this.renderTaskList(element, firstTaskSummary);
        return firstTaskSummary;
    }

    getFirstTaskSummary() {
        let requiredIndentation = 0;
        let isEnded = false;
        const topmostTasks = this.tasks.filter(t => {
            if (t.checked || isEnded) return false;
            if (t.indentationLevel < requiredIndentation) {
                isEnded = true;
                return false;
            };
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

    /**
     * removes all tasks with a type equal to the provided type
     * @param {string} filterType the type to be removed from the task list
     */
    removeType(filterType) {
        this.tasks = this.tasks.filter(task => task.type !== filterType);
        Routinify.instance.save();
        this.render();
    }

    /**
     * formulates a count with a noun, handling plural and singular nouns, and turning the values zero to twenty into words
     * @param {number} amount the amount of something
     * @param {string} singularNoun the singular spelling of the noun to be used when the amount is one
     * @param {string} pluralNoun the plural spelling of the noun to be used when the amount is not one
     * @returns {string} a count with a correctly-formatted noun like "five apples" or "one banana" or "no oranges" or "425 kiwis" or 8.5 melons or -1 pears
     */
    static pluralFix(amount, singularNoun, pluralNoun) {
        const numberWords = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
        const isFractional = amount % 1 !== 0;
        const numberWord = isFractional ? amount : numberWords[amount] ?? amount;
        const noun = amount === 1 ? singularNoun : pluralNoun;
        return `${numberWord} ${noun}`;
    }

    /**
     * 
     * @param {any} value 
     * @returns 
     */
    static isDefined(value) {
        switch (value) {
            case undefined: case null: case "undefined": case "null":
                return false;
            default:
                return true;
        }
    }
}
