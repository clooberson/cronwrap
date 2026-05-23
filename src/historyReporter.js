/**
 * historyReporter.js
 * Formats and prints job run history summaries.
 */

const { getHistory, getLastRun, summarizeHistory } = require('./history');

function formatEntry(entry) {
  const icon = entry.status === 'success' ? '✓' : '✗';
  const duration = entry.durationMs != null ? ` (${entry.durationMs}ms)` : '';
  const errNote = entry.error ? ` — ${entry.error}` : '';
  return `  [${entry.timestamp}] ${icon} ${entry.status}${duration}${errNote}`;
}

function formatHistoryReport(jobName, { limit } = {}) {
  let entries = getHistory(jobName);
  if (!entries.length) return `No history found for job: ${jobName}`;
  if (limit) entries = entries.slice(-limit);

  const summary = summarizeHistory(jobName);
  const lines = [
    `=== History: ${jobName} ===`,
    `Total: ${summary.totalRuns} | Successes: ${summary.successes} | Failures: ${summary.failures} | Avg: ${summary.avgDurationMs != null ? summary.avgDurationMs + 'ms' : 'n/a'}`,
    ...entries.map(formatEntry)
  ];
  return lines.join('\n');
}

function formatLastRun(jobName) {
  const entry = getLastRun(jobName);
  if (!entry) return `No runs recorded for job: ${jobName}`;
  return `Last run [${jobName}]: ${formatEntry(entry).trim()}`;
}

function printHistoryReport(jobName, options) {
  console.log(formatHistoryReport(jobName, options));
}

module.exports = { formatHistoryReport, formatLastRun, printHistoryReport };
