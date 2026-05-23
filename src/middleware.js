/**
 * Middleware pipeline for cronwrap job execution.
 * Allows composing pre/post hooks around job runs.
 */

/**
 * Compose an array of middleware functions into a single handler.
 * Each middleware receives (context, next) and must call next() to continue.
 * @param {Function[]} middlewares
 * @returns {Function} composed handler
 */
function compose(middlewares) {
  return async function (context) {
    let index = -1;

    async function dispatch(i) {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = middlewares[i];
      if (!fn) return;
      await fn(context, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
}

/**
 * Create a middleware runner for a job.
 * @param {Function[]} middlewares
 * @param {Function} job - the actual job function
 * @returns {Function} wrapped job
 */
function createPipeline(middlewares, job) {
  const all = [
    ...middlewares,
    async (ctx) => {
      ctx.result = await job(ctx);
    },
  ];
  return compose(all);
}

/**
 * Built-in timing middleware — records start/end time on context.
 */
async function timingMiddleware(ctx, next) {
  ctx.startedAt = Date.now();
  await next();
  ctx.finishedAt = Date.now();
  ctx.durationMs = ctx.finishedAt - ctx.startedAt;
}

/**
 * Built-in error capture middleware — catches errors and stores on context.
 */
async function errorCaptureMiddleware(ctx, next) {
  try {
    await next();
    ctx.success = true;
  } catch (err) {
    ctx.success = false;
    ctx.error = err;
  }
}

module.exports = { compose, createPipeline, timingMiddleware, errorCaptureMiddleware };
