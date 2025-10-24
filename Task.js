import { TodoList } from "./TodoList.js";

export class Task {
    // /** @type {any[]} */
    // subtasks;

    /**
     * 
     * @param {string} text 
     * @param {TodoList} list 
     */
    constructor( text, list ) {
        this.text = text;
        this.checked = false;
        this.id = Task.generateId();
    }

    /**
     * Toggle task completion
     */
    toggleTask() {
        this.checked = !this.checked;
        // this.reorder();
        TodoList.mainTodoList.save();
        TodoList.mainTodoList.render();
    }

    render() {
        const li = document.createElement('li');
        if (this.checked) li.classList.add('checked');
        li.addEventListener('click', () => this.toggleTask());

        // Task text (clicking toggles completion)
        const textSpan = document.createElement('span');
        textSpan.textContent = this.text;
        textSpan.className = 'task-text';

        // Delete button on the right
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'delete-btn';
        delBtn.setAttribute('aria-label', `Delete task ${this.text}`);
        delBtn.textContent = '✕';
        // Prevent the delete click from toggling the task
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            TodoList.mainTodoList.deleteTask(this.id);
        });

        li.appendChild(textSpan);
        li.appendChild(delBtn);
        return li;
    }

    static generateId(){
        return "id" + Math.random().toString(16).slice(2);
    }
}