// jobLifecycle.js — define and manage lifecycle hooks for jobs
// Hooks: beforeRun, afterRun, onSuccess, onFailure, onSkip

const VALID_HOOKS = ['beforeRun', 'afterRun', 'onSuccess', 'onFailure', 'onSkip'];

const lifecycleStore = {};

function getOrInitHooks(jobId) {
  if (!lifecycleStore[jobId]) {
    lifecycleStore[jobId] = {
      beforeRun: [],
      afterRun: [],
      onSuccess: [],
      onFailure: [],
      onSkip: [],
    };
  }
  return lifecycleStore[jobId];
}

function addHook(jobId, hookName, fn) {
  if (!VALID_HOOKS.includes(hookName)) {
    throw new Error(`Unknown lifecycle hook: ${hookName}`);
  }
  if (typeof fn !== 'function') {
    throw new Error('Hook must be a function');
  }
  const hooks = getOrInitHooks(jobId);
  hooks[hookName].push(fn);
}

function removeHook(jobId, hookName, fn) {
  const hooks = getOrInitHooks(jobId);
  if (!hooks[hookName]) return;
  hooks[hookName] = hooks[hookName].filter(h => h !== fn);
}

async function runHooks(jobId, hookName, context) {
  const hooks = getOrInitHooks(jobId);
  const fns = hooks[hookName] || [];
  for (const fn of fns) {
    await fn(context);
  }
}

function getHooks(jobId, hookName) {
  const hooks = getOrInitHooks(jobId);
  if (hookName) return hooks[hookName] || [];
  return { ...hooks };
}

function clearHooks(jobId) {
  delete lifecycleStore[jobId];
}

function clearAllHooks() {
  Object.keys(lifecycleStore).forEach(k => delete lifecycleStore[k]);
}

module.exports = {
  addHook,
  removeHook,
  runHooks,
  getHooks,
  clearHooks,
  clearAllHooks,
  VALID_HOOKS,
};
