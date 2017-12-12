/**
 * A class that intercepts console log messages and saves them
 * to be retrieved afterwards. This allows us to check if a given log
 * message was written during tests.
 */
class LogRecorder {

  constructor() {

    /**
     * The intercepted messages sent to <code>console.log</code>
     */
    this.logMessages = [];

    /**
     * The intercepted messages sent to <code>console.warn</code>
     */
    this.warnMessages = [];

    /**
     * The intercepted messages sent to <code>console.error</code>
     */
    this.errorMessages = [];

    this._redirectLogs();
  }

  _log(message) {
    this.logMessages.push(message);
    console._defaultLog(message);
  }

  _warn() {
    this.warnMessages.push(message);
    console._defaultWarn(message);
  }

  _error() {
    this.errorMessages.push(message);
    console._defaultError(message);
  }

  _redirectLogs() {
      if (console.log != this._log) {
        console._defaultLog = console.log;
        console.log = (message) => this._log(message);
      }
      if (console.warn != this._warn) {
        console._defaultWarn = console.warn;
        console.warn = (message) => this._warn(message);
      }
      if (console.error != this._error) {
        console._defaultError = console.error;
        console.error = (message) => this._error(message);
      }
  }

  /*
   * Clears the recorded log messages
   */
  clearLogs() {
    this.logMessages = [];
    this.warnMessages = [];
    this.errorMessages = [];
  }
}
