// jobQuotaMiddleware.js — middleware that enforces job run quotas

const { checkQuota, recordQuotaRun } = require('./jobQuota');

/**
 * withQuota(jobId) — wraps a job function, skipping execution if quota is exceeded.
 *
 * @param {string} jobId
 * @returns {function(fn: function): function}
 */
function withQuota(jobId) {
  return function (fn) {
    return async function quotaMiddleware(context) {
      const result = checkQuota(jobId);
      if (!result.allowed) {
        const msg = `[quota] Job "${jobId}" quota exceeded (limit ${result.limit} per ${result.windowMs}ms). Skipping.`;
        if (context && context.log) context.log(msg);
        else console.warn(msg);
        if (context) context.skippedByQuota = true;
        return;
      }
      recordQuotaRun(jobId);
      if (context) context.quotaRemaining = result.remaining - 1;
      return fn(context);
    };
  };
}

module.exports = { withQuota };
