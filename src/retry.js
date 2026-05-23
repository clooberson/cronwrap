/**
 * Retry logic for cronwrap
 * Handles retrying failed jobs with configurable backoff
 */

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate backoff delay based on attempt number
 * @param {number} attempt - current attempt (1-indexed)
 * @param {object} options
 * @param {number} options.baseDelay - base delay in ms (default 1000)
 * @param {boolean} options.exponential - use exponential backoff (default true)
 * @returns {number} delay in ms
 */
const getBackoffDelay = (attempt, options = {}) => {
  const { baseDelay = 1000, exponential = true } = options;
  if (!exponential) return baseDelay;
  return baseDelay * Math.pow(2, attempt - 1);
};

/**
 * Retry a function up to maxAttempts times
 * @param {Function} fn - async function to retry
 * @param {object} options
 * @param {number} options.maxAttempts - max number of attempts (default 3)
 * @param {number} options.baseDelay - base delay between retries in ms (default 1000)
 * @param {boolean} options.exponential - use exponential backoff (default true)
 * @param {Function} options.onRetry - called before each retry with (attempt, error)
 * @returns {Promise<any>} result of fn
 */
const withRetry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    exponential = true,
    onRetry = null,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;

      if (attempt < maxAttempts) {
        const delay = getBackoffDelay(attempt, { baseDelay, exponential });

        if (typeof onRetry === 'function') {
          onRetry(attempt, err, delay);
        }

        await sleep(delay);
      }
    }
  }

  throw lastError;
};

module.exports = { withRetry, getBackoffDelay };
