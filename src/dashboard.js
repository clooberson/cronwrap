/**
 * dashboard.js — Aggregates metrics and history into a single summary report
 */
const { getMetrics, listJobs } = require('./metrics');
const { getHistory, getLastRun } = require('./history');
const { formatJobReport } = require('./metricsReporter');
const { formatLastRun } = require('./historyReporter');

/**
 * Build a combined summary for a single job.
 * @param {string} jobName
 * @returns {string}
 */
function formatJobSummary(jobName) {
  const metrics = getMetrics(jobName);
  const history = getHistory(jobName);
  const lastRun = getLastRun(jobName);

  const lines = [];
  lines.push(`=== Job: ${jobName} ===`);

  if (!metrics) {
    lines.push('  No metrics recorded.');
  } else {
    lines.push(formatJobReport(jobName, metrics).trim());
  }

  lines.push(formatLastRun(jobName, lastRun).trim());
  lines.push(`  Total runs in history: ${history.length}`);

  return lines.join('\n');
}

/**
 * Build a full dashboard report for all known jobs.
 * @param {string[]} jobNames
 * @returns {string}
 */
function formatDashboard(jobNames) {
  if (!jobNames || jobNames.length === 0) {
    return 'No jobs registered.';
  }

  const sections = jobNames.map(name => formatJobSummary(name));
  const divider = '\n' + '-'.repeat(40) + '\n';
  return ['CRONWRAP DASHBOARD', '='.repeat(40), ...sections].join(divider);
}

/**
 * Print the full dashboard to stdout.
 * @param {string[]} jobNames
 */
function printDashboard(jobNames) {
  console.log(formatDashboard(jobNames));
}

module.exports = { formatJobSummary, formatDashboard, printDashboard };
