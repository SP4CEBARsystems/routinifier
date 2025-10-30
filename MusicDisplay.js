export default class MusicDisplay {
    static init() {
        (function initYouTubeStatusWatcher() {
            const ytEl = document.getElementById('youtubePlayer');
            const musicDetail = document.getElementById('musicDetailSummary');
            if (!ytEl || !musicDetail) return;

            function setStatusText(state) {
                let status;
                switch (state) {
                    case 1: status = 'Playing'; break;       // YT.PlayerState.PLAYING
                    case 2: status = 'Paused'; break;        // YT.PlayerState.PAUSED
                    case 0: status = 'Ended'; break;         // YT.PlayerState.ENDED
                    case 3: status = 'Buffering'; break;     // YT.PlayerState.BUFFERING
                    case -1: status = 'Unstarted'; break;    // YT.PlayerState.UNSTARTED
                    default: status = 'Stopped';
                }
                musicDetail.textContent = `Music: ${status}`;
            }

            // Ensure iframe has enablejsapi=1 so the JS API can control it
            const src = ytEl.getAttribute('src') || '';
            if (!/(\?|&)enablejsapi=1/.test(src)) {
                const sep = src.includes('?') ? '&' : '?';
                ytEl.setAttribute('src', src + sep + 'enablejsapi=1');
            }

            function createPlayer() {
                if (!window.YT || !window.YT.Player) return;
                // avoid creating multiple players
                if (this.youtubePlayer) return;
                this.youtubePlayer = new YT.Player('youtubePlayer', {
                    events: {
                        onReady: (e) => {
                            // set initial status
                            try {
                                const s = e.target.getPlayerState();
                                setStatusText(s);
                            } catch (err) {
                                setStatusText(-1);
                            }
                        },
                        onStateChange: (e) => {
                            setStatusText(e.data);
                        }
                    }
                });
            }

            if (window.YT && window.YT.Player) {
                createPlayer.call(this);
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
                    createPlayer.call(this);
                };
            }

        }).call(this);
    }
}