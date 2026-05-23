/**
 * Alerting module for cronwrap
 * Handles failure notifications via configurable alert handlers
 */

/**
 * Creates an alerting instance with the given configuration
 * @param {Object} options
 * @param {Function} options.onFailure - called when a job fails
 * @param {Function} options.onSuccess - optional, called when a job succeeds after previous failure
 * @param {number} options.threshold - number of consecutive failures before alerting (default: 1)
 */
function createAlerter(options = {}) {
  const {
    onFailure = null,
    onSuccess = null,
    threshold = 1,
  } = options;

  let consecutiveFailures = 0;
  let alertedFailure = false;

  return {
    /**
     * Record a job failure and trigger alert if threshold is met
     * @param {Error} error
     * @param {Object} context - job metadata (name, duration, etc.)
     */
    async recordFailure(error, context = {}) {
      consecutiveFailures += 1;

      if (consecutiveFailures >= threshold && onFailure) {
        alertedFailure = true;
        await onFailure({
          error,
          consecutiveFailures,
          ...context,
        });
      }
    },

    /**
     * Record a job success and optionally notify recovery
     * @param {Object} context - job metadata
     */
    async recordSuccess(context = {}) {
      const wasAlerting = alertedFailure;
      consecutiveFailures = 0;
      alertedFailure = false;

      if (wasAlerting && onSuccess) {
        await onSuccess(context);
      }
    },

    getConsecutiveFailures() {
      return consecutiveFailures;
    },

    reset() {
      consecutiveFailures = 0;
      alertedFailure = false;
    },
  };
}

module.exports = { createAlerter };
