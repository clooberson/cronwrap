/**
 * history.js
 * Tracks run history for cron jobs with a configurable max-entry cap.
 */

const histories = new Map();
const DEFAULT_MAX_ENTRIES = 50;

function getOrInitHistory(jobName, maxEntries = DEFAULT_MAX_ENTRIES) {
  if (!histories.has(jobName)) {
    histories.set(jobName, { entries: [], maxEntries });
  }
  return histories.get(jobName);
}

function recordHistory(jobName, { status, durationMs, error = null, timestamp = new Date().toISOString() }, maxEntries) {
  const history = getOrInitHistory(jobName, maxEntries);
  const entry = { status, durationMs, error: error ? String(error) : null, timestamp };
  history.entries.push(entry);
  if (history.entries.length > history.maxEntries) {
    history.entries.shift();
  }
  return entry;
}

function getHistory(jobName) {
  const history = histories.get(jobName);
  return history ? [...history.entries] : [];
}

function getLastRun(jobName) {
  const history = histories.get(jobName);
  if (!history || history.entries.length === 0) return null;
  return history.entries[history.entries.length - 1];
}

function clearHistory(jobName) {
  if (jobName) {
    histories.delete(jobName);
  } else {
    histories.clear();
  }
}

function summarizeHistory(jobName) {
  const entries = getHistory(jobName);
  if (entries.length === 0) return null;
  const successes = entries.filter(e => e.status === 'success').length;
  const failures = entries.filter(e => e.status === 'failure').length;
  const durations = entries.map(e => e.durationMs).filter(d => typeof d === 'number');
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  return { jobName, totalRuns: entries.length, successes, failures, avgDurationMs: avgDuration };
}

module.exports = { recordHistory, getHistory, getLastRun, clearHistory, summarizeHistory };
