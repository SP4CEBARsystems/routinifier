import { TodoList } from "./TodoList.js";

export class Templates {
    templates = {
        // work: ['Check emails', 'Meeting', 'Code review'],
        // study: ['Read chapter', 'Take notes', 'Practice exercises']
        work: [
            '1. Start music',
            '2. Start focus timer',
            '3. Write down session focus',
            '4. Write down known tasks in the todo list',
            '5. Write down all questions you have about the tasks to do in the todo list',
            '6. Write down sub-tasks for each question to answer it',
            '7. Write down sub-tasks for each remaining task to perform it',
            '8. Reorder tasks and start',
        ],
        break: [
            '1. Choose a task to start with after the break',
            '2. Drink water',
            '3. Do 10 pushups',
        ],
        continue: [
            '1. Continue the chosen task',
        ],
        arrivedHome: [
            '1. Stash jacket and shoes',
            '2. Bring bag upstairs',
            '3. (Optional) Eat and drink',
            '4. Pray',
            '5. Read bible',
            '6. Start routine: 90-minute-working-session',
        ]
    };

    /**
     * 
     * @param {TodoList} todoList 
     */
    constructor(todoList) {
        this.todoList = todoList;
    }

    /**
     * Add template tasks to the top of the list
     * @param {string} templateName
     */
    addTemplate(templateName) {
        const templateType = `routine-${templateName}`;
        const tasks = [...(this.doesTemplateExist(templateName) ? this.templates[templateName] : [])];
        tasks.reverse().forEach(t => this.todoList.addTaskAbove(t, false, 1, templateType));
        this.todoList.addTaskAbove(`${templateName} routine`, false, 0, templateType);
    }

    /**
     * remove template tasks from the list
     * @param {string} templateName
     */
    removeTemplate(templateName) {
        const templateType = `routine-${templateName}`;
        this.todoList.removeType(templateType);
    }

    /**
     * removes and adds template tasks to the top of the list
     * @param {string} templateName
     */
    addUniqueTemplate(templateName) {
        this.removeTemplate(templateName);
        this.addTemplate(templateName);
    }

    /**
     * @param {string} templateName 
     * @returns {boolean} true if the template exists, false otherwise
     */
    doesTemplateExist(templateName) {
        return Object.keys(this.templates).includes(templateName);
    }
}
