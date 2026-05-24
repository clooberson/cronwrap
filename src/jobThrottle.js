// jobThrottle.js — limit how often a job can run within a time window

const throttleMap = new Map();

function getOrInitThrottle(jobName, intervalMs) {
  if (!throttleMap.has(jobName)) {
    throttleMap.set(jobName, {
      intervalMs,
      lastRunAt: null,
      skippedCount: 0,
    });
  }
  return throttleMap.get(jobName);
}

function setThrottle(jobName, intervalMs) {
  if (typeof intervalMs !== 'number' || intervalMs <= 0) {
    throw new Error(`intervalMs must be a positive number, got: ${intervalMs}`);
  }
  throttleMap.set(jobName, {
    intervalMs,
    lastRunAt: null,
    skippedCount: 0,
  });
}

function shouldThrottle(jobName) {
  const state = throttleMap.get(jobName);
  if (!state) return false;
  if (state.lastRunAt === null) return false;
  const elapsed = Date.now() - state.lastRunAt;
  return elapsed < state.intervalMs;
}

function recordThrottledRun(jobName) {
  const state = throttleMap.get(jobName);
  if (!state) return;
  state.lastRunAt = Date.now();
  state.skippedCount = 0;
}

function recordSkip(jobName) {
  const state = throttleMap.get(jobName);
  if (!state) return;
  state.skippedCount += 1;
}

function getThrottleState(jobName) {
  return throttleMap.get(jobName) || null;
}

function removeThrottle(jobName) {
  throttleMap.delete(jobName);
}

function clearAllThrottles() {
  throttleMap.clear();
}

function listThrottles() {
  return Array.from(throttleMap.keys());
}

module.exports = {
  setThrottle,
  shouldThrottle,
  recordThrottledRun,
  recordSkip,
  getThrottleState,
  removeThrottle,
  clearAllThrottles,
  listThrottles,
  getOrInitThrottle,
};
