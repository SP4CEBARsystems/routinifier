// export default class VersionNumber {
//     static currentVersion = 1;

//     static oldestSupportedVersion = 1;

//     /** @type {number} */
//     number

//     /**
//      * 
//      * @param {number} [versionNumber=VersionNumber.currentVersion] 
//      */
//     constructor(versionNumber = VersionNumber.currentVersion) {
//         this.number = versionNumber;
//     }

//     toString() {
//         return this.number.toString();
//     }

//     isNewest() {
//         return this.number === VersionNumber.currentVersion;
//     }

//     isTooNew() {
//         return this.number > VersionNumber.currentVersion;
//     }

//     isTooOld() {
//         return this.number < VersionNumber.oldestSupportedVersion;
//     }

//     isSupported() {
//         return !this.isTooNew() && !this.isTooOld();
//     }

//     alertIfUnsupported() {
//         if (!this.isSupported()) {
//             window.alert(`Version ${this.number} is ${this.isTooNew() ? 'too new' : this.isTooOld() ? 'too old' : 'supported'} for your version ${VersionNumber.currentVersion}.`);
//         }
//     }

//     static alertIfUnsupported(version, currentVersion, oldestSupportedVersion) {
//         if (!this.isSupported()) {
//             window.alert(`Version ${this.number} is ${this.isTooNew() ? 'too new' : this.isTooOld() ? 'too old' : 'supported'} for your version ${VersionNumber.currentVersion}.`);
//         }
//     }

//     /**
//      * alertIfUnsupported
//      * @param {number} versionNumber 
//      */
//     static checkVersion(versionNumber) {
//         const version = new VersionNumber(versionNumber);
//         return version.alertIfUnsupported();
//     }
// }