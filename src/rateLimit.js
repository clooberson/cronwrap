/**
 * rateLimit.js
 * Tracks and enforces rate limits for cron job executions.
 * Prevents a job from running more than N times within a given window.
 */

const windows = new Map();

function getOrInitWindow(jobName) {
  if (!windows.has(jobName)) {
    windows.set(jobName, { count: 0, windowStart: Date.now(), violations: 0 });
  }
  return windows.get(jobName);
}

/**
 * Check whether a job is allowed to run given rate limit config.
 * @param {string} jobName
 * @param {{ maxRuns: number, windowMs: number }} config
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkRateLimit(jobName, config) {
  const { maxRuns, windowMs } = config;
  const now = Date.now();
  const state = getOrInitWindow(jobName);

  if (now - state.windowStart >= windowMs) {
    state.count = 0;
    state.windowStart = now;
  }

  if (state.count >= maxRuns) {
    state.violations += 1;
    const resetIn = Math.ceil((state.windowStart + windowMs - now) / 1000);
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${state.count}/${maxRuns} runs in window. Resets in ${resetIn}s.`
    };
  }

  state.count += 1;
  return { allowed: true };
}

function getRateLimitState(jobName) {
  return windows.get(jobName) || null;
}

function resetRateLimit(jobName) {
  windows.delete(jobName);
}

function resetAllRateLimits() {
  windows.clear();
}

module.exports = {
  checkRateLimit,
  getRateLimitState,
  resetRateLimit,
  resetAllRateLimits
};
