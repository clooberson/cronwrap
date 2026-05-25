// jobAnnotationsMiddleware.js — middleware that attaches annotations to job context

const { getAnnotations } = require('./jobAnnotations');

/**
 * withAnnotations(jobId) — injects current annotations into context before run,
 * and re-reads them after so callers always see the latest snapshot.
 *
 * @param {string} jobId
 * @returns {function} middleware
 */
function withAnnotations(jobId) {
  return async function annotationsMiddleware(context, next) {
    context.annotations = getAnnotations(jobId);
    await next();
    // refresh snapshot after job may have mutated annotations
    context.annotations = getAnnotations(jobId);
  };
}

module.exports = { withAnnotations };
