import { TodoList } from "./TodoList.js";

export class Task {
    // /** @type {any[]} */
    // subtasks;

    /**
     * 
     * @param {string} text 
     * @param {boolean} isChecked 
     */
    constructor(text, isChecked = false) {
        this.text = text;
        this.checked = isChecked;
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
        const li = this.renderLi();
        li.appendChild(this.renderTextSpan());
        li.appendChild(this.renderMoveUpBtn());
        li.appendChild(this.renderMoveDownBtn());
        li.appendChild(this.renderDelBtn());
        return li;
    }

    renderLi() {
        const li = document.createElement('li');
        if (this.checked) li.classList.add('checked');
        li.addEventListener('click', () => this.toggleTask());
        return li;
    }

    /** Task text (clicking toggles completion) */
    renderTextSpan() {
        const textSpan = document.createElement('span');
        textSpan.textContent = this.text;
        textSpan.className = 'task-text';
        return textSpan;
    }

    /** Delete button on the right */
    renderDelBtn() {
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
        return delBtn;
    }

    renderMoveUpBtn() {
        return this.renderMoveBtn('up');
    }

    renderMoveDownBtn() {
        return this.renderMoveBtn('down');
    }

    renderMoveBtn(direction) {
        const isUp = direction === 'up';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `move-btn move-${direction}`;
        btn.title = isUp ? 'Move up' : 'Move down';
        btn.setAttribute('aria-label', `${isUp ? 'Move task up' : 'Move task down'} ${this.text}`);
        btn.textContent = isUp ? '▲' : '▼';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const list = TodoList.mainTodoList;
            if (isUp) list.moveTaskUp(this.id);
            else list.moveTaskDown(this.id);
        });
        return btn;
    }

    static generateId() {
        return "id" + Math.random().toString(16).slice(2);
    }
}