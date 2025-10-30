/**
 * @class TextFileHandler
 * @classdesc Utility class for downloading and uploading plain text files in the browser.
 * @example
 * // Download example
 * TextFileHandler.download("Hello world!", "hello.txt");
 *
 * // Upload example
 * document.querySelector("#textInput").addEventListener("change", async (e) => {
 *     const file = e.target.files[0];
 *     const text = await TextFileHandler.upload(file);
 *     console.log(text);
 * });
 */
export class TextFileHandler {

    /**
     * Downloads a string as a plain text file.
     * @param {string} text - The text content to save.
     * @param {string} [filename='data.txt'] - The filename for the downloaded file.
     * @throws {TypeError} If text is not a string.
     * @returns {void}
     */
    static download(text, filename = 'data.txt') {
        if (typeof text !== 'string') {
            throw new TypeError('Expected a string for the text parameter.');
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Reads the contents of a plain text file selected by the user.
     * @param {File} file - The text file to read, typically from an <input type="file"> element.
     * @returns {Promise<string>} Resolves with the text content of the file.
     * @throws {TypeError} If the input is not a File object.
     */
    static async upload(file) {
        if (!(file instanceof File)) {
            throw new TypeError('Expected a File object.');
        }

        return file.text();
    }
}
