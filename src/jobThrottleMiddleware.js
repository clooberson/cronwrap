// jobThrottleMiddleware.js — wraps a job function with throttle enforcement

const {
  setThrottle,
  shouldThrottle,
  recordThrottledRun,
  recordSkip,
  getOrInitThrottle,
} = require('./jobThrottle');

/**
 * withThrottle(jobName, intervalMs, fn)
 * Returns a wrapped function that skips execution if the job
 * has run within the last `intervalMs` milliseconds.
 *
 * @param {string} jobName
 * @param {number} intervalMs
 * @param {Function} fn - the job function
 * @returns {Function}
 */
function withThrottle(jobName, intervalMs, fn) {
  setThrottle(jobName, intervalMs);

  return async function throttledJob(...args) {
    if (shouldThrottle(jobName)) {
      recordSkip(jobName);
      const state = getOrInitThrottle(jobName, intervalMs);
      const remaining = Math.ceil(
        (state.intervalMs - (Date.now() - state.lastRunAt)) / 1000
      );
      console.log(
        `[cronwrap] throttle: skipping "${jobName}" — next run allowed in ~${remaining}s`
      );
      return { skipped: true, jobName };
    }

    recordThrottledRun(jobName);
    const result = await fn(...args);
    return result;
  };
}

module.exports = { withThrottle };
