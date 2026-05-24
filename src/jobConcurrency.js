// Job concurrency control — limit how many instances of a job can run at once

const concurrencyMap = new Map();

function getOrInitConcurrency(jobName, limit = 1) {
  if (!concurrencyMap.has(jobName)) {
    concurrencyMap.set(jobName, { limit, running: 0, queued: 0 });
  }
  return concurrencyMap.get(jobName);
}

function setConcurrencyLimit(jobName, limit) {
  if (typeof limit !== 'number' || limit < 1) {
    throw new Error(`Concurrency limit must be a positive number, got: ${limit}`);
  }
  const state = getOrInitConcurrency(jobName, limit);
  state.limit = limit;
}

function getConcurrencyState(jobName) {
  return { ...getOrInitConcurrency(jobName) };
}

function canRun(jobName) {
  const state = getOrInitConcurrency(jobName);
  return state.running < state.limit;
}

function acquireSlot(jobName) {
  const state = getOrInitConcurrency(jobName);
  if (!canRun(jobName)) return false;
  state.running += 1;
  return true;
}

function releaseSlot(jobName) {
  const state = getOrInitConcurrency(jobName);
  if (state.running > 0) {
    state.running -= 1;
  }
}

function incrementQueued(jobName) {
  const state = getOrInitConcurrency(jobName);
  state.queued += 1;
}

function decrementQueued(jobName) {
  const state = getOrInitConcurrency(jobName);
  if (state.queued > 0) state.queued -= 1;
}

function resetConcurrency(jobName) {
  concurrencyMap.delete(jobName);
}

function resetAllConcurrency() {
  concurrencyMap.clear();
}

module.exports = {
  getOrInitConcurrency,
  setConcurrencyLimit,
  getConcurrencyState,
  canRun,
  acquireSlot,
  releaseSlot,
  incrementQueued,
  decrementQueued,
  resetConcurrency,
  resetAllConcurrency,
};
