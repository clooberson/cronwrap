/**
 * jobLock.js
 * Provides mutex-style locking for cron jobs to prevent concurrent execution.
 */

const locks = new Map();

function getOrInitLock(jobId) {
  if (!locks.has(jobId)) {
    locks.set(jobId, { locked: false, acquiredAt: null, owner: null });
  }
  return locks.get(jobId);
}

function acquireLock(jobId, owner = 'default') {
  const lock = getOrInitLock(jobId);
  if (lock.locked) {
    return false;
  }
  lock.locked = true;
  lock.acquiredAt = Date.now();
  lock.owner = owner;
  return true;
}

function releaseLock(jobId) {
  const lock = locks.get(jobId);
  if (!lock || !lock.locked) {
    return false;
  }
  lock.locked = false;
  lock.acquiredAt = null;
  lock.owner = null;
  return true;
}

function isLocked(jobId) {
  const lock = locks.get(jobId);
  return lock ? lock.locked : false;
}

function getLockState(jobId) {
  const lock = locks.get(jobId);
  if (!lock) return { locked: false, acquiredAt: null, owner: null };
  return { ...lock };
}

function getLockAge(jobId) {
  const lock = locks.get(jobId);
  if (!lock || !lock.locked || !lock.acquiredAt) return null;
  return Date.now() - lock.acquiredAt;
}

function forceRelease(jobId) {
  locks.delete(jobId);
}

function clearAllLocks() {
  locks.clear();
}

module.exports = {
  acquireLock,
  releaseLock,
  isLocked,
  getLockState,
  getLockAge,
  forceRelease,
  clearAllLocks,
};
