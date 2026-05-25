// jobLifecycleMiddleware.js — middleware that fires lifecycle hooks around job execution

const { runHooks } = require('./jobLifecycle');

async function withLifecycle(context, next) {
  const { jobId } = context;

  await runHooks(jobId, 'beforeRun', context);

  try {
    await next(context);
    await runHooks(jobId, 'onSuccess', context);
  } catch (err) {
    context.error = err;
    await runHooks(jobId, 'onFailure', context);
    throw err;
  } finally {
    await runHooks(jobId, 'afterRun', context);
  }
}

module.exports = { withLifecycle };
