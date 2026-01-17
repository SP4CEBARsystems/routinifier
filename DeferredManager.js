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

    resolve() {
        this.promiseManager.resolve();
    }

    reject() {
        this.promiseManager.reject();
    }
}