import ElementLoader from "./ElementLoader.js";
import EmbedMaker from "./EmbedMaker.js";
import TextInputHandler from "./TextInputHandler.js";
import VideoStatusDisplay from "./VideoStatusDisplay.js";

export default class VideoElement extends ElementLoader {
    static lofiGirlId = 'jfKfPfyJRdk';
    static atheistDelusionId = 'ChWiZ3iXWwM';
    static rayComfortApproachesToughLookingGuys = 'pYOEsNlPv9c';

    /** @type {HTMLElement|null} */
    iframeContainer = null;
    
    /** @type {HTMLElement|null} */
    status = null;
    
    /** @type {HTMLInputElement|null} */
    input = null;
    
    /** @type {HTMLButtonElement|null} */
    button = null;
    
    /** @type {HTMLInputElement|null} */
    followTimerCheckbox = null;

    mayPlayPauseAutomatically = false;

    _isPlaying = false;

    /**
     * 
     * @param {string} iframeContainerId 
     * @param {string} statusId 
     * @param {string} inputId 
     * @param {string} buttonId 
     * @param {string} followTimerCheckboxId 
     * @param {string} [defaultYTId] 
     * @param {string} [statusLabel] 
     * @param {string} [iframeElementId] 
     * @param {number} [defaultTimestamp] 
     */
    constructor(iframeContainerId, statusId, inputId, buttonId, followTimerCheckboxId, defaultYTId = VideoElement.lofiGirlId, statusLabel = 'Video: ', iframeElementId, defaultTimestamp) {
        super();
        [this.iframeContainer, this.status, this.input, this.button, this.followTimerCheckbox] = 
            /** @type {[HTMLElement, HTMLElement, HTMLInputElement, HTMLButtonElement, HTMLInputElement]} */
            (this.getElementsById(iframeContainerId, statusId, inputId, buttonId, followTimerCheckboxId));
        if ([this.iframeContainer, this.status, this.input, this.button].some((element) => element === null || element === undefined)) {
            return;
        }
        const iframeManager = new EmbedMaker(defaultYTId, null, true, this.iframeContainer ?? undefined, this.status ?? undefined, statusLabel, iframeElementId, defaultTimestamp);
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
            this.mayPlayPauseAutomatically = true;
            this._isPlaying = true;
        });
        display.setOnPaused(() => {
            const isPausingManually = this._isPlaying;
            console.log('pause', isPausingManually)
            if (isPausingManually) {
                this.mayPlayPauseAutomatically = false;
            }
        });
    }

    /** 
     * @param {'timer'|'undefined'} source
     */
    play(source = 'undefined') {
        if (!this.player) {
            console.error('youtube player unavailable, it may still be loading')
            return;
        }
        if (this.isPlaybackActionBlocked(source)) {
            return;
        }
        this.player.playVideo();
        this._isPlaying = true;
        this.mayPlayPauseAutomatically = true;
    }

    /** 
     * @param {'timer'|'undefined'} source
     */
    pause(source = 'undefined') {
        if (!this.player) {
            console.error('youtube player unavailable, it may still be loading');
            return;
        }
        if (this.isPlaybackActionBlocked(source)) {
            return;
        }
        this.player.pauseVideo();
        this._isPlaying = false;
    }

    /** 
     * @param {'timer'|'undefined'} source
     */
    stop(source = 'undefined') {
        if (!this.player) {
            console.error('youtube player unavailable, it may still be loading');
            return;
        }
        if (this.isPlaybackActionBlocked(source)) {
            return;
        }
        this.player.stopVideo();
        this._isPlaying = false;
        this.mayPlayPauseAutomatically = false;
    }

    /** 
     * @param {'timer'|'undefined'} source
     */
    isPlaybackActionBlocked(source) {
        return source === 'timer' && !this.followTimerCheckbox?.checked;
    }

    /** 
     * @param {'timer'|'undefined'} source
     */
    resume(source = 'undefined') {
        if (!this.mayPlayPauseAutomatically) return;
        this.play(source);
    }
}
