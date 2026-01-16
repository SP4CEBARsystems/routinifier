export default class AsyncHelpers {
    /**
 * Waits for an iframe to finish loading.
 *
 * @param {HTMLIFrameElement} iframe
 * @returns {Promise<HTMLIFrameElement>}
 */
    static waitForIframeLoad(iframe) {
        return new Promise((resolve, reject) => {
            if (!(iframe instanceof HTMLIFrameElement)) {
                reject(new TypeError('Expected an HTMLIFrameElement'));
                return;
            }

            // If it's already loaded (cached / fast)
            if (iframe.contentDocument?.readyState === 'complete') {
                resolve(iframe);
                return;
            }

            iframe.addEventListener(
                'load',
                () => resolve(iframe),
                { once: true }
            );

            iframe.addEventListener(
                'error',
                () => reject(new Error('Iframe failed to load')),
                { once: true }
            );
        });
    }

    /**
     * Waits until an element exists in the DOM.
     *
     * @param {string} selector
     * @param {ParentNode} root
     * @returns {Promise<Element>}
     */
    static waitForElement(selector, root = document) {
        return new Promise((resolve) => {
            const element = root.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const el = root.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(root, {
                childList: true,
                subtree: true
            });
        });
    }
}