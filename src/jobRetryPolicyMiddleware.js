// Middleware that applies the job's retry policy during execution

const { getJobPolicy, computeBackoff } = require('./jobRetryPolicy');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withRetryPolicy(jobId) {
  return async function retryPolicyMiddleware(context, next) {
    const policy = getJobPolicy(jobId);
    const maxAttempts = policy.maxAttempts || 1;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        context.attempt = attempt;
        context.policy = policy;
        await next();
        context.attempts = attempt;
        return;
      } catch (err) {
        lastError = err;
        context.lastRetryError = err.message;
        if (attempt < maxAttempts) {
          const delay = computeBackoff(policy, attempt);
          context.retryDelayMs = delay;
          await sleep(delay);
        }
      }
    }

    context.attempts = maxAttempts;
    context.failed = true;
    throw lastError;
  };
}

module.exports = { withRetryPolicy };
