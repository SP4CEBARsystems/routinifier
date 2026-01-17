import ElementLoader from "./ElementLoader.js";
import EmbedMaker from "./EmbedMaker.js";
import TextInputHandler from "./TextInputHandler.js";

export default class VideoElement extends ElementLoader {
    static lofiGirlId = 'jfKfPfyJRdk';
    static atheistDelusionId = 'ChWiZ3iXWwM';

    /** @type {HTMLElement|null} */
    iframeContainer = null;
    
    /** @type {HTMLElement|null} */
    status = null;
    
    /** @type {HTMLInputElement|null} */
    input = null;
    
    /** @type {HTMLButtonElement|null} */
    button = null;

    /**
     * 
     * @param {string} iframeContainerId 
     * @param {string} statusId 
     * @param {string} inputId 
     * @param {string} buttonId 
     * @param {string} [defaultYTId] 
     * @param {string} [statusLabel] 
     * @param {string} [iframeElementId] 
     */
    constructor(iframeContainerId, statusId, inputId, buttonId, defaultYTId = VideoElement.lofiGirlId, statusLabel = 'Video: ', iframeElementId) {
        super();
        [this.iframeContainer, this.status, this.input, this.button] = 
            /** @type {[HTMLElement, HTMLElement, HTMLInputElement, HTMLButtonElement]} */
            (this.getElementsById(iframeContainerId, statusId, inputId, buttonId));
        if ([this.iframeContainer, this.status, this.input, this.button].some((element) => element === null || element === undefined)) {
            return;
        }
        const iframeManager = new EmbedMaker(defaultYTId, null, true, this.iframeContainer ?? undefined, this.status ?? undefined, statusLabel, iframeElementId);
        
        if (this.input && this.button) {
            new TextInputHandler(this.input, this.button, (url) => {
                iframeManager?.createYouTubeIframeFromUrl(url);
            });
        }
    }
}
