export default class MusicDisplay {
    /**
     * 
     * @param {HTMLIFrameElement} ytEl 
     * @param {HTMLElement} musicDetail 
     * @returns 
     */
    constructor(ytEl, musicDetail) {
        this.ytEl = ytEl;
        this.musicDetail = musicDetail;

        this.src = this.ytEl.getAttribute('src') || '';
        this.enableJsApi();

        if (window.YT && window.YT.Player) {
            this.createPlayer();
        } else {
            // load the IFrame API if not already loaded
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
            }
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prev === 'function') prev();
                this.createPlayer();
            };
        }
    }

    /**
     * Ensure iframe has enablejsapi=1 so the JS API can control it
     */
    enableJsApi() {
        if (!/(\?|&)enablejsapi=1/.test(this.src)) {
            const sep = this.src.includes('?') ? '&' : '?';
            this.ytEl.setAttribute('src', this.src + sep + 'enablejsapi=1');
        }
    }

    createPlayer() {
        if (!window.YT || !window.YT.Player) return;
        // avoid creating multiple players
        if (this.youtubePlayer) return;
        this.youtubePlayer = new YT.Player('youtubePlayer', {
            events: {
                onReady: (e) => {
                    // set initial status
                    try {
                        const s = e.target.getPlayerState();
                        this.setStatusText(s);
                    } catch (err) {
                        this.setStatusText(-1);
                    }
                },
                onStateChange: (e) => {
                    this.setStatusText(e.data);
                }
            }
        });
    }

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