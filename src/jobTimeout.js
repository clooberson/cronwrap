// jobTimeout.js — per-job timeout enforcement

const timeouts = new Map();

function setTimeout_(jobName, ms) {
  if (typeof ms !== 'number' || ms <= 0) {
    throw new Error(`Invalid timeout value for job "${jobName}": ${ms}`);
  }
  timeouts.set(jobName, ms);
}

function getTimeout(jobName) {
  return timeouts.get(jobName) ?? null;
}

function removeTimeout(jobName) {
  return timeouts.delete(jobName);
}

function clearAllTimeouts() {
  timeouts.clear();
}

function listTimeouts() {
  return Array.from(timeouts.entries()).map(([name, ms]) => ({ name, ms }));
}

/**
 * Wraps a job function with a timeout. Rejects if job exceeds the limit.
 * @param {string} jobName
 * @param {Function} fn
 * @returns {Function}
 */
function withTimeout(jobName, fn) {
  const ms = getTimeout(jobName);
  if (ms === null) return fn;

  return async function (...args) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Job "${jobName}" timed out after ${ms}ms`));
      }, ms);
    });

    try {
      const result = await Promise.race([fn(...args), timeoutPromise]);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };
}

module.exports = {
  setTimeout: setTimeout_,
  getTimeout,
  removeTimeout,
  clearAllTimeouts,
  listTimeouts,
  withTimeout,
};
