export default class TextInputHandler {
    /**
     * 
     * @param {HTMLInputElement} input 
     * @param {HTMLButtonElement} button 
     * @param {(url:string)=>any} callback 
     */
    constructor(input, button, callback) {
        this.input = input;
        this.button = button;
        this.callback = callback;
        button.addEventListener('click', this.clickHandler.bind(this));
        input.addEventListener('keypress', this.keyPressHandler.bind(this));
    }

    onSet() {
        this.callback(this.input.value);
    }

    /**
     * 
     * @param {PointerEvent} event 
     */
    clickHandler(event) {
        this.onSet();
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    keyPressHandler(event) {
        switch (event.key) {
            case 'Enter':
                this.onSet();
                break;
        }
    }
}