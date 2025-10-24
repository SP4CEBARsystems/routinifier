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
     * @param {Array<string>} subtasks
     */
    addTask(text, subtasks = []) {
        const id = TodoList.generateId();
        this.tasks.push({ text, subtasks, checked: false, id });
        // this.reorder();
        this.save();
        this.render();
    }

    /**
     * Add a task to the top
     * @param {string} text
     * @param {Array<string>} subtasks
     */
    addTaskAbove(text, subtasks = []) {
        const id = TodoList.generateId();
        this.tasks.unshift({ text, subtasks, checked: false, id });
        this.save();
        this.render();
    }

    /**
     * Toggle task completion
     * @param {any} task
     */
    toggleTask(task) {
        task.checked = !task.checked;
        // this.reorder();
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

    createTaskElement(task) {
        const li = document.createElement('li');
        if (task.checked) li.classList.add('checked');
        li.addEventListener('click', () => this.toggleTask(task));

        // Task text (clicking toggles completion)
        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        textSpan.className = 'task-text';

        // Delete button on the right
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'delete-btn';
        delBtn.setAttribute('aria-label', `Delete task ${task.text}`);
        delBtn.textContent = '✕';
        // Prevent the delete click from toggling the task
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });

        li.appendChild(textSpan);
        li.appendChild(delBtn);
        return li;
    }

    /** Get top-most task text */
    getTopTask() {
        const top = this.tasks.find(t => !t.checked);
        return top ? top.text : '';
    }

    static generateId(){
        return "id" + Math.random().toString(16).slice(2);
    }
}
