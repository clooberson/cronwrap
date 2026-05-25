// jobStatus.js — track and query per-job run status (idle, running, success, failed)

const statusStore = {};

const VALID_STATUSES = ['idle', 'running', 'success', 'failed'];

function getOrInitStatus(jobId) {
  if (!statusStore[jobId]) {
    statusStore[jobId] = {
      status: 'idle',
      lastUpdated: null,
      lastError: null,
    };
  }
  return statusStore[jobId];
}

function setStatus(jobId, status, error = null) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const entry = getOrInitStatus(jobId);
  entry.status = status;
  entry.lastUpdated = new Date().toISOString();
  entry.lastError = error ? String(error) : null;
  return { ...entry };
}

function getStatus(jobId) {
  return { ...getOrInitStatus(jobId) };
}

function isRunning(jobId) {
  return getOrInitStatus(jobId).status === 'running';
}

function getJobsByStatus(status) {
  return Object.entries(statusStore)
    .filter(([, entry]) => entry.status === status)
    .map(([jobId]) => jobId);
}

function clearStatus(jobId) {
  delete statusStore[jobId];
}

function clearAllStatuses() {
  Object.keys(statusStore).forEach(k => delete statusStore[k]);
}

module.exports = {
  setStatus,
  getStatus,
  isRunning,
  getJobsByStatus,
  clearStatus,
  clearAllStatuses,
};
