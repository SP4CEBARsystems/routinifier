import Deferred from "./Deferred.js";

export default class DeferredManager {
    constructor() {
        this.promiseManager = new Deferred();
    }
    
    resetPromise() {
        this.promiseManager = new Deferred();
    }

    getPromise() {
        return  this.promiseManager.promise;
    }

    /**
     * 
     * @param {*} [item] 
     */
    resolve(item) {
        this.promiseManager.resolve(item);
    }

    /**
     * 
     * @param {Error} [error] 
     */
    reject(error) {
        this.promiseManager.reject(error);
    }
}