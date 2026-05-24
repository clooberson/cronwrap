/**
 * jobLockMiddleware.js
 * Middleware that wraps a job with lock acquisition/release logic.
 * Skips execution if the job is already running.
 */

const { acquireLock, releaseLock, isLocked } = require('./jobLock');

/**
 * Wraps a job function with lock protection.
 * If the lock cannot be acquired, the job is skipped.
 *
 * @param {string} jobId - Unique job identifier
 * @param {Function} fn - Async job function
 * @param {object} [options]
 * @param {Function} [options.onSkip] - Called when job is skipped due to lock
 * @returns {Function} Wrapped job function
 */
function withLock(jobId, fn, options = {}) {
  const { onSkip } = options;

  return async function lockedJob(...args) {
    if (isLocked(jobId)) {
      if (typeof onSkip === 'function') {
        onSkip(jobId);
      }
      return { skipped: true, reason: 'job already running', jobId };
    }

    const acquired = acquireLock(jobId, 'lockedJob');
    if (!acquired) {
      if (typeof onSkip === 'function') {
        onSkip(jobId);
      }
      return { skipped: true, reason: 'failed to acquire lock', jobId };
    }

    try {
      const result = await fn(...args);
      return result;
    } finally {
      releaseLock(jobId);
    }
  };
}

module.exports = { withLock };
