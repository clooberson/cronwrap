// jobQuota.js — per-job run quota enforcement (max runs per time window)

const quotas = {};

function getOrInitQuota(jobId) {
  if (!quotas[jobId]) {
    quotas[jobId] = { limit: null, windowMs: null, runs: [], enabled: false };
  }
  return quotas[jobId];
}

function setQuota(jobId, limit, windowMs) {
  if (typeof limit !== 'number' || limit < 1) throw new Error('limit must be a positive number');
  if (typeof windowMs !== 'number' || windowMs < 1) throw new Error('windowMs must be a positive number');
  const q = getOrInitQuota(jobId);
  q.limit = limit;
  q.windowMs = windowMs;
  q.enabled = true;
  q.runs = [];
}

function removeQuota(jobId) {
  delete quotas[jobId];
}

function _pruneWindow(q) {
  const now = Date.now();
  q.runs = q.runs.filter(ts => now - ts < q.windowMs);
}

function checkQuota(jobId) {
  const q = quotas[jobId];
  if (!q || !q.enabled) return { allowed: true, remaining: null };
  _pruneWindow(q);
  const remaining = q.limit - q.runs.length;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining), limit: q.limit, windowMs: q.windowMs };
}

function recordQuotaRun(jobId) {
  const q = getOrInitQuota(jobId);
  if (!q.enabled) return;
  _pruneWindow(q);
  q.runs.push(Date.now());
}

function getQuotaState(jobId) {
  const q = quotas[jobId];
  if (!q || !q.enabled) return null;
  _pruneWindow(q);
  return { jobId, limit: q.limit, windowMs: q.windowMs, usedInWindow: q.runs.length, remaining: q.limit - q.runs.length };
}

function resetAllQuotas() {
  Object.keys(quotas).forEach(k => delete quotas[k]);
}

module.exports = { getOrInitQuota, setQuota, removeQuota, checkQuota, recordQuotaRun, getQuotaState, resetAllQuotas };
