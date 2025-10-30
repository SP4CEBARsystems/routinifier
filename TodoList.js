import { Task } from "./Task.js";
import { TextFileHandler } from "./TextFileHandler.js";
// import VersionNumber from "./VersionNumber.js";

export class TodoList {
    /** @type {TodoList} */
    static mainTodoList;

    /** @type {HTMLElement} */
    static firstTaskSummary;

    static version = 1;

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
        this.version = TodoList.version;
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
        this.save();
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

    getExportObject() {
        return {
            version: this.version,
            tasks: this.tasks.map(task => task.getExportObject()),
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
        TextFileHandler.download(jsonTaskList, `routinify-tasks-v${TodoList.version}.json`);
    }

    /** Load from localStorage */
    load() {
        this.setJson(localStorage.getItem('todoTasks'));
    }

    /** Load from file upload 
     * @param {File} file 
    */
    async loadFile(file) {
        const isTaskListValuable = this.tasks.length > 0;
        if (isTaskListValuable) {
            if (!window.confirm('are you sure you want to replace your tasks with the tasks from the file?')) return;
        }
        this.clear();
        const json = await TextFileHandler.upload(file);
        console.log('File contents:\n', json);
        this.setJson(json);
    }

    clear() {
        this.tasks = [];
    }
    
    /**
     * 
     * @param {string} json 
    */
    setJson(json) {
        const data = TodoList.isDefined(json) ? JSON.parse(json) ?? [] : [];
        const tasks = data.tasks;
        // VersionNumber.checkVersion(tasks.version);
        // if (tasks.version >= TodoList.version) {
        //     window.alert(`loading an old file`);
        // }
        this.setTasks(tasks);
    }

    /**
     * 
     * @param {Task[]} tasks
     */
    setTasks(tasks) {
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
