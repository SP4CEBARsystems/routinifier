export class TodoList {
    /**
     * Creates a ToDo list instance.
     * @param {HTMLElement} listElement
     */
    constructor(listElement) {
        this.listElement = listElement;
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
        this.listElement.innerHTML = '';
        this.tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task.text;
            if (task.checked) li.classList.add('checked');

            li.addEventListener('click', () => this.toggleTask(index));
            this.listElement.appendChild(li);
        });
    }

    /** Get top-most task text */
    getTopTask() {
        const top = this.tasks.find(t => !t.checked);
        return top ? top.text : '';
    }
}
