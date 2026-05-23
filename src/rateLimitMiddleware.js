/**
 * rateLimitMiddleware.js
 * Wraps a cron job function with rate limiting logic.
 * Integrates with the logger and alerter if provided.
 */

const { checkRateLimit } = require('./rateLimit');

/**
 * Wrap a job function with rate limit enforcement.
 *
 * @param {string} jobName
 * @param {Function} fn - The job to wrap
 * @param {{ maxRuns: number, windowMs: number }} rateLimitConfig
 * @param {{ logger?: object, alerter?: object }} options
 * @returns {Function}
 */
function withRateLimit(jobName, fn, rateLimitConfig, options = {}) {
  const { logger, alerter } = options;

  return async function rateLimitedJob(...args) {
    const { allowed, reason } = checkRateLimit(jobName, rateLimitConfig);

    if (!allowed) {
      const msg = `[${jobName}] Skipped — ${reason}`;

      if (logger && typeof logger.warn === 'function') {
        logger.warn(msg);
      } else {
        console.warn(msg);
      }

      if (alerter && typeof alerter.send === 'function') {
        await alerter.send({
          level: 'warn',
          job: jobName,
          message: reason,
          type: 'rate_limit_exceeded'
        });
      }

      return { skipped: true, reason };
    }

    return fn(...args);
  };
}

module.exports = { withRateLimit };
