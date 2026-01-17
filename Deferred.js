/**
 * Deferred promise wrapper.
 * Allows resolving or rejecting a promise externally.
 */
export default class Deferred {
    /**
     * @type {Promise<any>}
     */
    promise;

    /**
     * @type {(value?: any) => void}
     */
    resolve = Deferred._undefinedState;

    /**
     * @type {(reason?: any) => void}
     */
    reject = Deferred._undefinedState;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    static _undefinedState() {
        console.error('deferred promise method unassigned');
    }
}
