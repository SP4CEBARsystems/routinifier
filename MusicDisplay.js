/**
 * @typedef YTObject 
 * @property {new (...args: any[]) => Object|undefined} Player
 * 
 * @typedef YTAPI 
 * @property {()=>void|undefined} onYouTubeIframeAPIReady
 * @property {YTObject|undefined} YT
 * 
 * @typedef {Window & typeof globalThis & YTAPI} WindowWithYTAPI
 */

export default class MusicDisplay {
    /**
     * Creates a status display for YouTube embed iFrames that is updated by the youtube API
     * @param {HTMLIFrameElement} ytEl 
     * @param {HTMLElement} musicDetail 
     */
    constructor(ytEl, musicDetail) {
        this.ytEl = ytEl;
        this.musicDetail = musicDetail;
        
        this.window = /** @type {WindowWithYTAPI} */(window);
        /** @type {Document} */
        this.document = document;
        this.src = this.ytEl.getAttribute('src') || '';
        this.enableJsApi();
        this.prepareCreatePlayer();
    }

    /**
     * Ensure iframe has enablejsapi=1 so the JS API can control it
     */
    enableJsApi() {
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
            const prev = this.window.onYouTubeIframeAPIReady;
            this.window.onYouTubeIframeAPIReady = () => {
                if (typeof prev === 'function') prev();
                this.createPlayer();
            };
        }
    }

    /**
     * creates a script element as a child of this.document.head
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
        this.youtubePlayer = new this.window.YT.Player('youtubePlayer', {
            events: {
                /** @param {{target:{getPlayerState:Function}}} e */
                onReady: (e) => {
                    // set initial status
                    try {
                        const s = e.target.getPlayerState();
                        this.setStatusText(s);
                    } catch (err) {
                        this.setStatusText(-1);
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
     */
    setStatusText(state) {
        let status;
        switch (state) {
            case 1: status = 'Playing'; break;       // YT.PlayerState.PLAYING
            case 2: status = 'Paused'; break;        // YT.PlayerState.PAUSED
            case 0: status = 'Ended'; break;         // YT.PlayerState.ENDED
            case 3: status = 'Buffering'; break;     // YT.PlayerState.BUFFERING
            case -1: status = 'Unstarted'; break;    // YT.PlayerState.UNSTARTED
            default: status = 'Stopped';
        }
        this.musicDetail.textContent = `Music: ${status}`;
    }
}