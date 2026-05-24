// jobEventsMiddleware.js — middleware that fires lifecycle events around a job run

const { emit } = require('./jobEvents');

/**
 * Returns a middleware function that emits beforeRun/afterRun/onSuccess/onFailure
 * events for the given job name.
 *
 * @param {string} jobName
 * @returns {function} middleware
 */
function withJobEvents(jobName) {
  return async function jobEventsMiddleware(ctx, next) {
    await emit(jobName, 'beforeRun', { context: ctx });

    try {
      await next(ctx);
      await emit(jobName, 'afterRun', { context: ctx, success: true });
      await emit(jobName, 'onSuccess', { context: ctx });
    } catch (err) {
      await emit(jobName, 'afterRun', { context: ctx, success: false, error: err });
      await emit(jobName, 'onFailure', { context: ctx, error: err });
      throw err;
    }
  };
}

module.exports = { withJobEvents };
