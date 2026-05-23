/**
 * scheduleConfig.js
 * Loads job schedule definitions from a plain JS/JSON config object
 * and registers them with the scheduler.
 */

const { scheduleJob } = require('./scheduler');

/**
 * Expected config shape:
 * [
 *   {
 *     name: 'my-job',
 *     expression: '0 * * * *',
 *     handler: async () => { ... },
 *     options: { retries: 2, timeout: 5000 }  // optional
 *   }
 * ]
 */
function loadScheduleConfig(jobDefinitions) {
  if (!Array.isArray(jobDefinitions)) {
    throw new TypeError('Job definitions must be an array.');
  }

  const registered = [];

  for (const def of jobDefinitions) {
    const { name, expression, handler, options = {} } = def;

    if (!name || typeof name !== 'string') {
      throw new TypeError(`Each job definition must have a string "name". Got: ${JSON.stringify(name)}`);
    }
    if (!expression || typeof expression !== 'string') {
      throw new TypeError(`Job "${name}" must have a string "expression".`);
    }
    if (typeof handler !== 'function') {
      throw new TypeError(`Job "${name}" must have a function "handler".`);
    }

    const job = scheduleJob(name, expression, handler, options);
    job.start();
    registered.push(job);
  }

  return registered;
}

module.exports = { loadScheduleConfig };
