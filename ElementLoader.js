export default class ElementLoader {
    constructor() {
        
    }

    /**
     * 
     * @param  {...string} ids 
     */
    getElementsById(...ids) {
        return ids.map(id => document.getElementById(id));
    }
}