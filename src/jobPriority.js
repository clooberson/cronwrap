// Job priority levels and management

const PRIORITY_LEVELS = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5
};

const priorities = new Map();

function setPriority(jobName, level) {
  if (!Object.values(PRIORITY_LEVELS).includes(level)) {
    throw new Error(`Invalid priority level: ${level}. Use PRIORITY_LEVELS constants.`);
  }
  priorities.set(jobName, level);
}

function getPriority(jobName) {
  return priorities.get(jobName) ?? PRIORITY_LEVELS.NORMAL;
}

function removePriority(jobName) {
  return priorities.delete(jobName);
}

function getJobsByPriority(level) {
  return [...priorities.entries()]
    .filter(([, p]) => p === level)
    .map(([name]) => name);
}

function sortJobsByPriority(jobNames) {
  return [...jobNames].sort((a, b) => getPriority(a) - getPriority(b));
}

function listPriorities() {
  return Object.fromEntries(priorities);
}

function clearPriorities() {
  priorities.clear();
}

module.exports = {
  PRIORITY_LEVELS,
  setPriority,
  getPriority,
  removePriority,
  getJobsByPriority,
  sortJobsByPriority,
  listPriorities,
  clearPriorities
};
