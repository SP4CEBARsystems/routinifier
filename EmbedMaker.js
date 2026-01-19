import AsyncHelpers from "./AsyncHelpers.js";
import DeferredManager from "./DeferredManager.js";
import VideoStatusDisplay from "./VideoStatusDisplay.js";

export default class EmbedMaker extends DeferredManager {
    /**
     * Creates a YouTube iframe element for a video and/or playlist.
     * The promise property will fulfil when the iframe is ready to play, and reject after a possible retry and when it can not be loaded.
     * @param {string|null} [videoId]
     * @param {string|null} [playlistId]
     * @param {boolean} [isJsApiEnabled]
     * @param {HTMLElement} [parentElement]
     * @param {HTMLElement} [statusDisplayElement]
     * @param {string} [statusDisplayLabel]
     * @param {string} [iframeElementId]
     * @param {number} [timestamp] 
     */
    constructor(videoId = null, playlistId = null, isJsApiEnabled = false, parentElement, statusDisplayElement, statusDisplayLabel, iframeElementId = 'youtubePlayer', timestamp) {
        super();
        this.videoId = videoId;
        this.playlistId = playlistId;
        this.isJsApiEnabled = isJsApiEnabled;
        this.parentElement = parentElement;
        this.statusDisplayElement = statusDisplayElement;
        this.statusDisplayLabel = statusDisplayLabel;
        this.iframeElementId = iframeElementId;
        this.timestamp = timestamp;
        this.resetCount = 0;
        this.resetDisplay();
        this.iframeDetectionPromise = this.createYouTubeIframe();
    }
    
    /**
     * 
     * @param {string} url 
     * @returns 
     */
    static extractYouTubeIds(url) {
        const regex = /(?:(?:youtube\.com\/(?:playlist|embed\/videoseries))|(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11}))\??(?:&?si=[a-zA-Z0-9_-]+)?.*?&?(?:amp;)?(?:list=([a-zA-Z0-9_-]+))?/;
        const match = url.match(regex);
        if (!match) return {
            videoId: null, 
            playlistId: null
        };
        return {
            videoId: match[1] || null,
            playlistId: match[2] || null
        };
    }

    /**
     * 
     * @param {string} url 
     * @param {boolean} [isJsApiEnabled]
     * @param {HTMLElement} [parentElement]
     * @param {HTMLElement} [statusDisplayElement]
     * @returns {Promise<HTMLIFrameElement>}
     */
    createYouTubeIframeFromUrl(url, isJsApiEnabled = false, parentElement, statusDisplayElement) {
        const {videoId, playlistId} = EmbedMaker.extractYouTubeIds(url);
        return this.createYouTubeIframe(videoId, playlistId, isJsApiEnabled, parentElement, statusDisplayElement);
    }

    /**
     * Creates a YouTube iframe element for a video and/or playlist.
     * @param {string|null} [videoId]
     * @param {string|null} [playlistId]
     * @param {boolean} [isJsApiEnabled]
     * @param {HTMLElement} [parentElement]
     * @param {HTMLElement} [statusDisplayElement]
     * @param {boolean} [resetResetCount]
     * @param {number} [timestamp] 
     * @returns {Promise<HTMLIFrameElement>}
     */
    async createYouTubeIframe(
        videoId = this.videoId ?? null, 
        playlistId = this.playlistId ?? null, 
        isJsApiEnabled = this.isJsApiEnabled ?? false, 
        parentElement = this.parentElement, 
        statusDisplayElement = this.statusDisplayElement,
        resetResetCount = true,
        timestamp = this.timestamp
    ) {
        if (resetResetCount) {
            this.resetCount = 0;
            this.resetPromise();
        }
        if (videoId && videoId !== this.videoId) {
            this.videoId = videoId;
        }
        if (playlistId && playlistId !== this.playlistId) {
            this.playlistId = playlistId;
        }
        if (timestamp && timestamp !== this.timestamp) {
            this.timestamp = timestamp;
        }
        this.isJsApiEnabled = isJsApiEnabled;
        this.parentElement = parentElement;
        this.statusDisplayElement = statusDisplayElement;
        const newSrc = EmbedMaker.getSrc(playlistId, videoId, isJsApiEnabled, timestamp);
        if (this.iframe?.src && this.iframe?.src === newSrc) {
            // identical
            return this.iframe;
        }
        const iframe = document.createElement("iframe");
        this.iframe = iframe;
        iframe.id = this.iframeElementId;
        iframe.src = newSrc;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;

        if (parentElement) {
            await EmbedMaker.appendToElement(parentElement, iframe);
        }
        this.resetDisplay();
        return iframe;
    }

    resetDisplay() {
        if (!this.statusDisplayElement) return;
        if (this.display) {
            if (this.iframe) {
                this.display.reset(this.iframe);
                if (this.display) this.display.getPromise()
                    .then(this.onVideoReady.bind(this))
                    .catch(this.onVideoError.bind(this));
            }
        } else {
            this.display = new VideoStatusDisplay(this.statusDisplayElement, this.iframe, this.statusDisplayLabel, this.iframeElementId);
            if (this.display) this.display.getPromise()
                .then(this.onVideoReady.bind(this))
                .catch(this.onVideoError.bind(this));
        }
    }

    onVideoError() {
        this.resetCount++;
        const resetAttempts = this.playlistId ? 1 : 0;
        if (this.resetCount > resetAttempts) {
            this.reject();
            return;
        }
        const isPlaylistIncluded = this.resetCount !== 1;
        this.iframe?.remove();
        this.createYouTubeIframe(this.videoId, isPlaylistIncluded ? this.playlistId : null, undefined, undefined, undefined, false);
    }

    onVideoReady() {
        this.resolve({iframe: this.iframe, display:this.display, player:this.display?.youtubePlayer});
    }

    destroy() {
        this.display?.destroy();
        this.iframe?.remove();
    }

    /**
     * 
     * @param {string|null} [playlistId] 
     * @param {string|null} [videoId] 
     * @param {boolean} [isJsApiEnabled] 
     * @param {number} [timestamp] 
     * @returns {string}
     */
    static getSrc(playlistId = null, videoId = null, isJsApiEnabled = false, timestamp) {
        let src;
        let queries = isJsApiEnabled ? 'enablejsapi=1' : '';
        queries = `${queries}${queries && timestamp ? '&' : ''}${timestamp ? `amp;start=${timestamp}` : ''}`;
        // const queries = '';
        if (playlistId && videoId) {
            // Video that is part of a playlist
            src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?list=${encodeURIComponent(playlistId)}${queries ? '&' : ''}${queries}`;
        } else if (playlistId) {
            // Playlist only
            src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}${queries ? '&' : ''}${queries}`;
        } else if (videoId) {
            // Single video
            src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}${queries ? '?' : ''}${queries}`;
        } else {
            throw new Error("No videoId or playlistId provided");
        }
        return src;
    }

    /**
     * Adds an iframe to a container element and waits for at least one iframe to be detected on that container element.
     * @param {HTMLElement} container 
     * @param {HTMLIFrameElement} iframe 
     */
    static async appendToElement(container, iframe) {
        container.appendChild(iframe);
        return AsyncHelpers.waitForElement('iframe', container);
    }
}