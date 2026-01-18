import ElementLoader from "./ElementLoader.js";
import EmbedMaker from "./EmbedMaker.js";
import TextInputHandler from "./TextInputHandler.js";
import VideoStatusDisplay from "./VideoStatusDisplay.js";

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

    hasPlayed = false;

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
        iframeManager.getPromise().then(this.onYTPlayerReady.bind(this));
        
        if (this.input && this.button) {
            new TextInputHandler(this.input, this.button, (url) => {
                iframeManager?.createYouTubeIframeFromUrl(url);
                iframeManager.getPromise().then(this.onYTPlayerReady.bind(this));
            });
        }

    }

    /**
     * 
     * @param {{player:{playVideo:()=>void, pauseVideo:()=>void, stopVideo:()=>void}, display:VideoStatusDisplay}} param0 
     */
    onYTPlayerReady({player, display}) {
        this.player = player;
        display.setOnPlaying(() => {
            console.log('playing');
            this.hasPlayed = true
        });
    }

    play() {
        if (!this.player) {
            console.error('youtube player unavailable, it may still be loading')
            return;
        }
        this.player.playVideo();
        this.hasPlayed = true;
    }
    
    pause() {
        if (!this.player) {
            console.error('youtube player unavailable, it may still be loading')
            return;
        }
        this.player.pauseVideo();
    }
    
    stop() {
        if (!this.player) {
            console.error('youtube player unavailable, it may still be loading')
            return;
        }
        this.player.stopVideo();
        this.hasPlayed = false;
    }

    resume() {
        if (!this.hasPlayed) return;
        this.play();
    }
}
