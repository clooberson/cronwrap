// jobStatusMiddleware.js — middleware that automatically updates job status around execution

const { setStatus, isRunning } = require('./jobStatus');

/**
 * withJobStatus(jobId)
 * Returns a middleware that sets job status to 'running' before the job
 * and 'success' or 'failed' after, based on outcome.
 *
 * Optionally pass { allowConcurrent: true } to skip the running-guard check.
 */
function withJobStatus(jobId, options = {}) {
  const { allowConcurrent = false } = options;

  return async function jobStatusMiddleware(ctx, next) {
    if (!allowConcurrent && isRunning(jobId)) {
      const msg = `Job "${jobId}" is already running — skipping.`;
      if (ctx && ctx.log) ctx.log(msg);
      else console.warn(`[cronwrap] ${msg}`);
      return;
    }

    setStatus(jobId, 'running');

    try {
      await next();
      setStatus(jobId, 'success');
    } catch (err) {
      setStatus(jobId, 'failed', err);
      throw err;
    }
  };
}

module.exports = { withJobStatus };
