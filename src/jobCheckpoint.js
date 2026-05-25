// jobCheckpoint.js — track progress checkpoints within a long-running job

const checkpoints = new Map();

function getOrInitCheckpoints(jobId) {
  if (!checkpoints.has(jobId)) {
    checkpoints.set(jobId, []);
  }
  return checkpoints.get(jobId);
}

function saveCheckpoint(jobId, label, data = {}) {
  const list = getOrInitCheckpoints(jobId);
  const entry = {
    label,
    data,
    savedAt: new Date().toISOString()
  };
  list.push(entry);
  return entry;
}

function getCheckpoints(jobId) {
  return getOrInitCheckpoints(jobId).slice();
}

function getLastCheckpoint(jobId) {
  const list = getOrInitCheckpoints(jobId);
  return list.length > 0 ? list[list.length - 1] : null;
}

function hasCheckpoint(jobId, label) {
  return getOrInitCheckpoints(jobId).some(c => c.label === label);
}

function clearCheckpoints(jobId) {
  checkpoints.set(jobId, []);
}

function clearAllCheckpoints() {
  checkpoints.clear();
}

module.exports = {
  saveCheckpoint,
  getCheckpoints,
  getLastCheckpoint,
  hasCheckpoint,
  clearCheckpoints,
  clearAllCheckpoints
};
