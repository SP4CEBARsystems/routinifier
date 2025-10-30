import { TodoList } from "./TodoList.js";

export class Task {
    // /** @type {any[]} */
    // subtasks;

    /**
     * 
     * @param {string} text 
     * @param {boolean} isChecked 
     * @param {number} [indentationLevel=0] 
     * @param {string} [type='user'] 
     */
    constructor(text, isChecked = false, indentationLevel = 0, type = 'user') {
        this.text = text;
        this.checked = isChecked;
        this.indentationLevel = indentationLevel;
        this.id = Task.generateId();
        this.li = document.createElement('li');
        this.type = type;
    }

    /**
     * Toggle task completion
     */
    toggleTask() {
        this.checked = !this.checked;
        this.getAllChildren(TodoList.mainTodoList.tasks).forEach(task => task.checked = this.checked);
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
        // this.render();
        TodoList.mainTodoList.render();
    }

    render() {
        const li = this.renderLi();
        this.renderIndent(li);
        const container = this.renderContainer();
        li.appendChild(container);
        container.appendChild(this.renderTextSpan());
        container.appendChild(this.renderMoveUpBtn());
        container.appendChild(this.renderMoveDownBtn());
        container.appendChild(this.renderIndentLeftBtn());
        container.appendChild(this.renderIndentRightBtn());
        container.appendChild(this.renderDelBtn());
        return li;
    }

    renderLi() {
        const li = this.li;
        li.innerHTML = '';
        li.className = this.checked ? 'checked' : '';
        return li;
    }

    renderContainer() {
        const container = document.createElement('div');
        container.addEventListener('click', () => this.toggleTask());
        container.classList.add('taskContainer');
        return container;
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

    /**
     * 
     * @param {Task[]} taskList 
     * @returns {number}
     */
    getIndex(taskList) {
        return taskList.findIndex(t => t.id === this.id);
    }

    /**
     * Gets a selected number of generations (children, grandchildren, etc.) from this task in a specified list.
     * @param {Task[]} taskList the list of task to search through
     * @param {number} [generationLimit=0] the amount of generations to get: 0 gets you all generations, 1 and above gets you 1 and above generations
     * @param {boolean} [hasToBeChecked=false] enables checking if the task is checked
     */
    getChildren(taskList, generationLimit = 1, hasToBeChecked = false) {
        const thisIndex = this.getIndex(taskList);
        const childIndentationLevel = this.indentationLevel + 1;
        const cutoffIndentationLevel = childIndentationLevel + generationLimit - 1;
        const isGenerationLimited = generationLimit > 0;
        let isDone = false;
        return taskList.filter((task, i) => {
            if (
                isDone || 
                thisIndex >= i || 
                hasToBeChecked && task.checked || 
                isGenerationLimited && task.indentationLevel > cutoffIndentationLevel
            ) return false;
            if (task.indentationLevel < childIndentationLevel) {
                isDone = true
                return false;
            }
            return true;
        });
    }

    /**
     * Gets all children, grandchildren, etc. of this task in a specified list.
     * @param {Task[]} taskList the list of task to search through
     * @param {boolean} [hasToBeChecked] enables checking if the task is checked
     */
    getAllChildren(taskList, hasToBeChecked){
        return this.getChildren(taskList, 0, hasToBeChecked);
    }

    /**
     * Gets the amount of children, grandchildren, etc. of this task in a specified list.
     * @param {Task[]} taskList the list of task to search through
     * @param {boolean} [hasToBeChecked] enables checking if the task is checked
     */
    getChildCount(taskList, hasToBeChecked){
        return this.getChildren(taskList, 0, hasToBeChecked).length;
    }

    getExportObject() {
        return {
            checked: this.checked,
            indentationLevel: this.indentationLevel,
            text: this.text,
            type: this.type,
        };
    }

    static generateId() {
        return "id" + Math.random().toString(16).slice(2);
    }
}