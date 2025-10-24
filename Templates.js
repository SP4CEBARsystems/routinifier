export class Templates {
    constructor(todoList) {
        this.todoList = todoList;
        this.templates = {
            work: ['Check emails', 'Meeting', 'Code review'],
            study: ['Read chapter', 'Take notes', 'Practice exercises']
        };
    }

    /**
     * Add template tasks to the top of the list
     * @param {string} templateName
     */
    addTemplate(templateName) {
        const tasks = this.templates[templateName] || [];
        tasks.reverse().forEach(t => this.todoList.addTask(t));
    }
}
