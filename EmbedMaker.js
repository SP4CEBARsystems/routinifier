import AsyncHelpers from "./AsyncHelpers.js";
import VideoStatusDisplay from "./VideoStatusDisplay.js";

export default class EmbedMaker {
    /**
     * Creates a YouTube iframe element for a video and/or playlist.
     * @param {string|null} [videoId]
     * @param {string|null} [playlistId]
     * @param {boolean} [isJsApiEnabled]
     * @param {HTMLElement} [parentElement]
     * @param {HTMLElement} [statusDisplayElement]
     * @param {string} [statusDisplayLabel]
     */
    constructor(videoId = null, playlistId = null, isJsApiEnabled = false, parentElement, statusDisplayElement, statusDisplayLabel) {
        this.videoId = videoId;
        this.playlistId = playlistId;
        this.isJsApiEnabled = isJsApiEnabled;
        this.parentElement = parentElement;
        this.statusDisplayElement = statusDisplayElement;
        this.statusDisplayLabel = statusDisplayLabel;
        this.resetCount = 0;
        this.resetDisplay();
        this.createYouTubeIframe();
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
     * @returns {Promise<HTMLIFrameElement>}
     */
    async createYouTubeIframe(
        videoId = this.videoId ?? null, 
        playlistId = this.playlistId ?? null, 
        isJsApiEnabled = this.isJsApiEnabled ?? false, 
        parentElement = this.parentElement, 
        statusDisplayElement = this.statusDisplayElement
    ) {
        const iframe = document.createElement("iframe");
        this.iframe = iframe;
        iframe.id = 'youtubePlayer';
        iframe.src = EmbedMaker.getSrc(playlistId, videoId, isJsApiEnabled);
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
            }
        } else {
            this.display = new VideoStatusDisplay(this.statusDisplayElement, this.iframe, this.statusDisplayLabel);
            if (this.display) this.display.onError = this.onVideoError.bind(this);
        }
    }

    onVideoError() {
        this.resetCount++;
        const resetAttempts = this.playlistId ? 1 : 0;
        if (this.resetCount > resetAttempts) return;
        const isPlaylistIncluded = this.resetCount !== 1;
        this.iframe?.remove();
        this.createYouTubeIframe(this.videoId, isPlaylistIncluded ? this.playlistId : null);
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
     * @returns {string}
     */
    static getSrc(playlistId = null, videoId = null, isJsApiEnabled = false) {
        let src;
        const queries = isJsApiEnabled ? 'enablejsapi=1' : '';
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