/**
 * metrics.js
 * Tracks run counts, durations, and failure stats for cron jobs.
 */

const metrics = {};

function getOrInit(jobName) {
  if (!metrics[jobName]) {
    metrics[jobName] = {
      runs: 0,
      failures: 0,
      lastRunAt: null,
      lastDurationMs: null,
      totalDurationMs: 0,
    };
  }
  return metrics[jobName];
}

function recordRun(jobName, durationMs, failed = false) {
  const m = getOrInit(jobName);
  m.runs += 1;
  m.lastRunAt = new Date().toISOString();
  m.lastDurationMs = durationMs;
  m.totalDurationMs += durationMs;
  if (failed) {
    m.failures += 1;
  }
}

function getMetrics(jobName) {
  if (jobName) {
    return getOrInit(jobName);
  }
  return { ...metrics };
}

function resetMetrics(jobName) {
  if (jobName) {
    delete metrics[jobName];
  } else {
    Object.keys(metrics).forEach((k) => delete metrics[k]);
  }
}

function averageDurationMs(jobName) {
  const m = getOrInit(jobName);
  if (m.runs === 0) return 0;
  return Math.round(m.totalDurationMs / m.runs);
}

function successRate(jobName) {
  const m = getOrInit(jobName);
  if (m.runs === 0) return null;
  return parseFloat((((m.runs - m.failures) / m.runs) * 100).toFixed(2));
}

module.exports = { recordRun, getMetrics, resetMetrics, averageDurationMs, successRate };
