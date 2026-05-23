/**
 * cronwrap — lightweight wrapper adding logging, alerting, and retry logic to cron jobs
 */

const { createLogger } = require('./logger');
const { createAlerter } = require('./alerting');
const { withRetry } = require('./retry');

/**
 * Sleep helper
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wrap a cron job function with logging, alerting, and optional retry logic
 * @param {string} name - job name used in logs and alerts
 * @param {Function} fn - async job function
 * @param {object} options
 * @param {object} [options.logger] - custom logger (defaults to createLogger)
 * @param {object} [options.alerter] - custom alerter (defaults to createAlerter)
 * @param {number} [options.retries=0] - number of retry attempts (0 = no retries)
 * @param {number} [options.retryDelay=1000] - base delay between retries in ms
 * @param {boolean} [options.exponentialBackoff=true] - use exponential backoff for retries
 * @param {number} [options.timeout] - job timeout in ms (optional)
 * @returns {Function} wrapped job function
 */
const cronwrap = (name, fn, options = {}) => {
  const {
    logger = createLogger(name),
    alerter = createAlerter(),
    retries = 0,
    retryDelay = 1000,
    exponentialBackoff = true,
    timeout = null,
  } = options;

  return async (...args) => {
    const startTime = Date.now();
    logger.info(`Job started: ${name}`);

    const runJob = async () => {
      if (timeout) {
        return Promise.race([
          fn(...args),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Job timed out after ${timeout}ms`)), timeout)
          ),
        ]);
      }
      return fn(...args);
    };

    const maxAttempts = retries + 1;

    try {
      const result = await withRetry(runJob, {
        maxAttempts,
        baseDelay: retryDelay,
        exponential: exponentialBackoff,
        onRetry: (attempt, err, delay) => {
          logger.warn(`Retry ${attempt}/${retries} for job "${name}" after error: ${err.message}. Waiting ${delay}ms.`);
        },
      });

      const duration = Date.now() - startTime;
      logger.info(`Job completed: ${name} (${duration}ms)`);
      return result;
    } catch (err) {
      const duration = Date.now() - startTime;
      logger.error(`Job failed: ${name} (${duration}ms) — ${err.message}`);
      await alerter.send({
        job: name,
        error: err.message,
        duration,
        attempts: maxAttempts,
      });
      throw err;
    }
  };
};

module.exports = { cronwrap, sleep };
