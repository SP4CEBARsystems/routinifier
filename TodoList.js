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
        this.tasks.push({ text, subtasks, checked: false });
        this.reorder();
        this.save();
        this.render();
    }

    /**
     * Add a task to the top
     * @param {string} text
     * @param {Array<string>} subtasks
     */
    addTaskAbove(text, subtasks = []) {
        this.tasks.unshift({ text, subtasks, checked: false });
        this.save();
        this.render();
    }

    /**
     * Toggle task completion
     * @param {number} index
     */
    toggleTask(index) {
        this.tasks[index].checked = !this.tasks[index].checked;
        this.reorder();
        this.save();
        this.render();
    }

    /** Delete a task by index 
     * @param index {number}
    */
    deleteTask(index) {
        this.tasks.splice(index, 1);
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
        tasks.forEach((task, index) => {
            const li = this.createTaskElement(task, index);
            element.appendChild(li);
        });
    }

    createTaskElement(task, index) {
        const li = document.createElement('li');
        if (task.checked) li.classList.add('checked');
        li.addEventListener('click', () => this.toggleTask(index));

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
            this.deleteTask(index);
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
}
