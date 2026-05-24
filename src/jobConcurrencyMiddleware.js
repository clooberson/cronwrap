// Middleware that enforces concurrency limits on job execution

const {
  canRun,
  acquireSlot,
  releaseSlot,
  incrementQueued,
  decrementQueued,
  setConcurrencyLimit,
} = require('./jobConcurrency');

/**
 * withConcurrency(jobName, fn, options)
 * Wraps a job function with concurrency control.
 * options.limit     — max concurrent runs (default 1)
 * options.queue     — if true, wait for a slot instead of skipping (default false)
 * options.queueTimeout — ms to wait for a slot before giving up (default 5000)
 */
async function withConcurrency(jobName, fn, options = {}) {
  const { limit = 1, queue = false, queueTimeout = 5000 } = options;
  setConcurrencyLimit(jobName, limit);

  if (canRun(jobName)) {
    acquireSlot(jobName);
    try {
      return await fn();
    } finally {
      releaseSlot(jobName);
    }
  }

  if (!queue) {
    return { skipped: true, reason: 'concurrency_limit_reached', job: jobName };
  }

  // Queue mode: poll until a slot is free or timeout
  incrementQueued(jobName);
  const deadline = Date.now() + queueTimeout;

  return new Promise((resolve, reject) => {
    const poll = setInterval(async () => {
      if (!canRun(jobName)) {
        if (Date.now() >= deadline) {
          clearInterval(poll);
          decrementQueued(jobName);
          reject(new Error(`[cronwrap] Job "${jobName}" timed out waiting for concurrency slot`));
        }
        return;
      }
      clearInterval(poll);
      decrementQueued(jobName);
      acquireSlot(jobName);
      try {
        resolve(await fn());
      } catch (err) {
        reject(err);
      } finally {
        releaseSlot(jobName);
      }
    }, 50);
  });
}

module.exports = { withConcurrency };
