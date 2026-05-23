/**
 * metricsReporter.js
 * Formats and outputs metrics summaries for cron jobs.
 */

const { getMetrics, averageDurationMs, successRate } = require('./metrics');

function formatJobReport(jobName) {
  const m = getMetrics(jobName);
  const avg = averageDurationMs(jobName);
  const rate = successRate(jobName);

  return [
    `=== Metrics Report: ${jobName} ===`,
    `  Total Runs    : ${m.runs}`,
    `  Failures      : ${m.failures}`,
    `  Success Rate  : ${rate !== null ? rate + '%' : 'N/A'}`,
    `  Avg Duration  : ${avg}ms`,
    `  Last Run At   : ${m.lastRunAt || 'never'}`,
    `  Last Duration : ${m.lastDurationMs !== null ? m.lastDurationMs + 'ms' : 'N/A'}`,
  ].join('\n');
}

function formatAllReports() {
  const all = getMetrics();
  const jobNames = Object.keys(all);
  if (jobNames.length === 0) {
    return 'No metrics recorded yet.';
  }
  return jobNames.map(formatJobReport).join('\n\n');
}

function printReport(jobName, logger = console) {
  const report = jobName ? formatJobReport(jobName) : formatAllReports();
  logger.log(report);
  return report;
}

module.exports = { formatJobReport, formatAllReports, printReport };
