import DeferredManager from "./DeferredManager.js";
/**
 * @typedef YTObject 
 * @property {new (...args: any[]) => YTPlayer|undefined} Player
 * 
 * @typedef YTAPI 
 * @property {()=>void|undefined} onYouTubeIframeAPIReady
 * @property {YTObject|undefined} YT
 * 
 * @typedef {Window & typeof globalThis & YTAPI} WindowWithYTAPI
 */


export default class VideoStatusDisplay extends DeferredManager {
    /** 
     * @typedef {Object} YTPlayer
     * @property {()=>any} destroy
     */
    /** 
     * @type {YTPlayer|undefined} 
     */
    youtubePlayer

    /** @type {'Playing'|'Paused'|'Ended'|'Buffering'|'Error'|'Unstarted'|'Ready'|'Stopped'|'Initializing'} */
    status = 'Initializing';

    /**
     * @type {(()=>void) | undefined}
     */
    _onPlaying

    /**
     * @type {(()=>void) | undefined}
     */
    _onPaused

    /**
     * Creates a status display for YouTube embed iFrames that is updated by the youtube API
     * @param {HTMLElement} musicDetail 
     * @param {HTMLIFrameElement} [ytEl] 
     * @param {string} [label] 
     * @param {string} [iframeElementId] 
     */
    constructor(musicDetail, ytEl, label = 'Video: ', iframeElementId = 'youtubePlayer') {
        super();
        this.ytEl = ytEl;
        this.musicDetail = musicDetail;
        this.label = label;
        this.iframeElementId = iframeElementId;
        this.window = /** @type {WindowWithYTAPI} */(window);
        /** @type {Document} */
        this.document = document;
        if (this.ytEl) {
            this.enableJsApi();
            this.prepareCreatePlayer();
        }
    }

    /**
     * 
     * @param {(()=>void) | undefined} value 
     */
    setOnPlaying(value) {
        this._onPlaying = value;
    }

    /**
     * 
     * @param {(()=>void) | undefined} value 
     */
    setOnPaused(value) {
        this._onPaused = value;
    }

    /**
     * 
     * @param {HTMLIFrameElement} ytEl 
     */
    reset(ytEl) {
        this.ytEl = ytEl;
        this.destroy();
        this.resetPromise();
        this.enableJsApi();
        this.prepareCreatePlayer();
    }

    destroy() {
        this.youtubePlayer?.destroy();
        this.youtubePlayer = undefined;
    }

    /**
     * Ensure iframe has enablejsapi=1 so the JS API can control it
     */
    enableJsApi() {
        if (!this.ytEl) return;
        this.src = this.ytEl.getAttribute('src') || '';
        const isJsApiEnabled = /(\?|&)enablejsapi=1/.test(this.src);
        if (isJsApiEnabled) return;
        const separator = this.src.includes('?') ? '&' : '?';
        this.ytEl.setAttribute('src', `${this.src}${separator}enablejsapi=1`);
    }

    /**
     * Calls for player creation or to set up the youtube API to call for player creation.
     */
    prepareCreatePlayer() {
        if (this.window.YT && this.window.YT.Player) {
            this.createPlayer();
        } else {
            // load the IFrame API if not already loaded
            this.createScriptTag('https://www.youtube.com/iframe_api');
            this.assignToYTAPIHook(this.createPlayer.bind(this));
        }
    }

    /**
     * Assigns an additional function to the this.window.onYouTubeIframeAPIReady hook
     * @param {()=>any} callback the new function to be assigned
     */
    assignToYTAPIHook(callback) {
        const prev = this.window.onYouTubeIframeAPIReady;
        this.window.onYouTubeIframeAPIReady = () => {
            if (typeof prev === 'function') prev();
            callback();
        };
    }

    /**
     * creates a script element named 'tag' as a child of this.document.head
     * @param {string} tagUrl source of the script
     */
    createScriptTag(tagUrl) {
        const doesTagExist = this.document.querySelector(`script[src="${tagUrl}"]`);
        if (doesTagExist) return;
        const tag = this.document.createElement('script');
        tag.src = tagUrl;
        this.document.head.appendChild(tag);
    }

    /**
     * Creates a youtube player to update status
     */
    createPlayer() {
        if (!this.window.YT || !this.window.YT.Player) return;
        // avoid creating multiple players
        if (this.youtubePlayer) return;
        this.youtubePlayer = new this.window.YT.Player(this.iframeElementId, {
            events: {
                /** @param {{target:{getPlayerState:Function}}} e */
                onReady: (e) => {
                    // set initial status
                    try {
                        const s = e.target.getPlayerState();
                        this.setStatusText(s, true);
                    } catch (err) {
                        this.setStatusText(-1, true);
                    }
                },
                /** @param {{data:number}} e */
                onStateChange: (e) => {
                    this.setStatusText(e.data);
                }
            }
        });
    }

    /**
     * Interprets YouTube embed video state and displays it on the this.musicDetail element.
     * @param {number} state 
     * @param {boolean} isReady
     */
    setStatusText(state, isReady = false) {
        /** @type {'Playing'|'Paused'|'Ended'|'Buffering'|'Error'|'Unstarted'|'Ready'|'Stopped'} */
        let status;
        switch (state) {
            case 1: status = 'Playing'; break;       // YT.PlayerState.PLAYING
            case 2: status = 'Paused'; break;        // YT.PlayerState.PAUSED
            case 0: status = 'Ended'; break;         // YT.PlayerState.ENDED
            case 3: status = 'Buffering'; break;     // YT.PlayerState.BUFFERING
            case -1: status = isReady ? 'Error' : 'Unstarted'; break;    // YT.PlayerState.UNSTARTED
            default: status = isReady ? 'Ready' : 'Stopped';
        }
        this.musicDetail.textContent = `${this.label}${status}`;
        this.status = status;
        switch (status) {
            case 'Ready': this.resolve(this.youtubePlayer); break;
            case 'Error': this.reject(); break;
            case 'Paused': if (this._onPaused) this._onPaused(); break;
            case 'Playing': if (this._onPlaying) this._onPlaying(); break;
        }
    }
}
