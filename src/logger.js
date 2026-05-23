/**
 * Creates a simple namespaced logger for cronwrap jobs.
 * @param {string} name - The job name used as a log prefix
 * @returns {{ info: Function, error: Function, warn: Function }}
 */
function createLogger(name) {
  const prefix = `[cronwrap:${name}]`;

  function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${prefix} ${level.toUpperCase()} ${message}`;
  }

  return {
    info(message) {
      console.log(formatMessage('info', message));
    },
    warn(message) {
      console.warn(formatMessage('warn', message));
    },
    error(message) {
      console.error(formatMessage('error', message));
    },
  };
}

module.exports = { createLogger };
