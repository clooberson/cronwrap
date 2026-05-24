// jobEvents.js — simple event emitter for job lifecycle hooks

const listeners = {};

const VALID_EVENTS = ['beforeRun', 'afterRun', 'onSuccess', 'onFailure', 'onSkip', 'onRetry'];

function getOrInitEvent(jobName, event) {
  if (!listeners[jobName]) listeners[jobName] = {};
  if (!listeners[jobName][event]) listeners[jobName][event] = [];
  return listeners[jobName][event];
}

function on(jobName, event, handler) {
  if (!VALID_EVENTS.includes(event)) {
    throw new Error(`Unknown event: ${event}. Valid events: ${VALID_EVENTS.join(', ')}`);
  }
  if (typeof handler !== 'function') throw new Error('Handler must be a function');
  getOrInitEvent(jobName, event).push(handler);
}

function off(jobName, event, handler) {
  const list = getOrInitEvent(jobName, event);
  const idx = list.indexOf(handler);
  if (idx !== -1) list.splice(idx, 1);
}

async function emit(jobName, event, payload = {}) {
  const list = getOrInitEvent(jobName, event);
  for (const handler of list) {
    await handler({ jobName, event, ...payload });
  }
}

function listListeners(jobName) {
  if (!listeners[jobName]) return {};
  return Object.fromEntries(
    Object.entries(listeners[jobName]).map(([evt, fns]) => [evt, fns.length])
  );
}

function clearListeners(jobName) {
  if (jobName) {
    delete listeners[jobName];
  } else {
    Object.keys(listeners).forEach(k => delete listeners[k]);
  }
}

module.exports = { on, off, emit, listListeners, clearListeners, VALID_EVENTS };
