/**
 * dependencyRunner.js
 * Runs a job only when all its declared dependencies have completed.
 * Integrates with jobDependencies to check readiness.
 */

const { getDependencies, areDependenciesMet, hasCircularDependency } = require('./jobDependencies');

/**
 * Runs jobs in dependency order.
 * @param {string[]} jobNames - ordered list of job names to attempt
 * @param {Object} jobFns - map of jobName -> async function
 * @param {Object} options
 * @param {Function} [options.onSkip] - called when a job is skipped due to unmet deps
 * @param {Function} [options.onError] - called when a job throws
 * @returns {Object} result map: jobName -> { status, result?, error? }
 */
async function runWithDependencies(jobNames, jobFns, options = {}) {
  const { onSkip, onError } = options;
  const completed = new Set();
  const results = {};

  for (const name of jobNames) {
    if (hasCircularDependency(name)) {
      const err = new Error(`Circular dependency detected for job "${name}"`);
      results[name] = { status: 'error', error: err };
      if (onError) onError(name, err);
      continue;
    }

    const deps = getDependencies(name);
    const met = areDependenciesMet(name, completed);

    if (!met) {
      const missing = deps.filter((d) => !completed.has(d));
      results[name] = { status: 'skipped', missing };
      if (onSkip) onSkip(name, missing);
      continue;
    }

    const fn = jobFns[name];
    if (!fn) {
      results[name] = { status: 'error', error: new Error(`No function registered for job "${name}"`) };
      continue;
    }

    try {
      const result = await fn();
      completed.add(name);
      results[name] = { status: 'success', result };
    } catch (err) {
      results[name] = { status: 'error', error: err };
      if (onError) onError(name, err);
    }
  }

  return results;
}

module.exports = { runWithDependencies };
