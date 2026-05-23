const { createLogger } = require('./logger');

/**
 * Wraps a cron job function with logging, retry logic, and alerting.
 * @param {Function} fn - The job function to wrap (can be async)
 * @param {Object} options - Configuration options
 * @param {string} [options.name='job'] - Name of the job for logging
 * @param {number} [options.retries=0] - Number of retry attempts on failure
 * @param {number} [options.retryDelay=1000] - Delay between retries in ms
 * @param {Function} [options.onError] - Callback invoked on final failure
 * @param {Function} [options.onSuccess] - Callback invoked on success
 */
function cronwrap(fn, options = {}) {
  const {
    name = 'job',
    retries = 0,
    retryDelay = 1000,
    onError = null,
    onSuccess = null,
  } = options;

  const logger = createLogger(name);

  return async function wrappedJob(...args) {
    let attempt = 0;
    const maxAttempts = retries + 1;

    while (attempt < maxAttempts) {
      attempt++;
      const isRetry = attempt > 1;

      if (isRetry) {
        logger.info(`Retry attempt ${attempt - 1} of ${retries}`);
      } else {
        logger.info('Starting job');
      }

      const startTime = Date.now();

      try {
        const result = await fn(...args);
        const duration = Date.now() - startTime;
        logger.info(`Job completed successfully in ${duration}ms`);

        if (typeof onSuccess === 'function') {
          await onSuccess({ name, duration, attempt });
        }

        return result;
      } catch (err) {
        const duration = Date.now() - startTime;
        logger.error(`Job failed after ${duration}ms: ${err.message}`);

        if (attempt < maxAttempts) {
          logger.info(`Waiting ${retryDelay}ms before retry...`);
          await sleep(retryDelay);
        } else {
          logger.error(`Job exhausted all ${maxAttempts} attempt(s). Giving up.`);

          if (typeof onError === 'function') {
            await onError({ name, error: err, attempts: attempt });
          }

          throw err;
        }
      }
    }
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { cronwrap };
