import { TodoList } from "./TodoList.js";

export class Task {
    // /** @type {any[]} */
    // subtasks;

    /**
     * 
     * @param {string} text 
     * @param {boolean} isChecked 
     * @param {number} [indentationLevel=0] 
     */
    constructor(text, isChecked = false, indentationLevel = 0) {
        this.text = text;
        this.checked = isChecked;
        this.indentationLevel = indentationLevel;
        this.id = Task.generateId();
        this.li = document.createElement('li');
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

    /**
     * adds an indent offset to this task's indentation level
     * @param {number} delta 
     */
    addIndent( delta ) {
        this.indentationLevel += delta;
        if (this.indentationLevel < 0) {
            this.indentationLevel = 0;
        }
        TodoList.mainTodoList.save();
        this.render();
    }

    render() {
        const li = this.renderLi();
        this.renderIndent(li);
        li.appendChild(this.renderTextSpan());
        li.appendChild(this.renderMoveUpBtn());
        li.appendChild(this.renderMoveDownBtn());
        li.appendChild(this.renderIndentLeftBtn());
        li.appendChild(this.renderIndentRightBtn());
        li.appendChild(this.renderDelBtn());
        return li;
    }

    renderLi() {
        const li = this.li;
        li.innerHTML = '';
        li.className = this.checked ? 'checked' : '';
        li.addEventListener('click', () => this.toggleTask());
        return li;
    }

    /**
     * 
     * @param {HTMLLIElement} li 
     */
    renderIndent(li) {
        console.log('in', this.indentationLevel);
        for (let i = 0; i < this.indentationLevel; i++) {
            const div = document.createElement('div');
            div.textContent = '>';
            div.className = 'indentSpacer';
            li.appendChild(div);
        }
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

    renderIndentLeftBtn() {
        return this.renderIndentBtn('left');
    }

    renderIndentRightBtn() {
        return this.renderIndentBtn('right');
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

    renderIndentBtn(direction) {
        const isLeft = direction === 'left';
        const indentOffset = isLeft ? -1 : 1;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `move-btn move-${direction}`;
        btn.title = isLeft ? 'Move left' : 'Move right';
        btn.setAttribute('aria-label', `${isLeft ? 'Move task left' : 'Move task right'} ${this.text}`);
        btn.textContent = isLeft ? '◀' : '▶';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addIndent(indentOffset);
        });
        return btn;
    }

    static generateId() {
        return "id" + Math.random().toString(16).slice(2);
    }
}