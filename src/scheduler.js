const cron = require('node-cron');

const scheduledJobs = new Map();

/**
 * Schedule a wrapped cron job with a cron expression.
 * @param {string} name - Unique job name
 * @param {string} expression - Cron expression (e.g. '* * * * *')
 * @param {Function} fn - The job function to run
 * @param {object} options - Options passed to cronwrap
 * @returns {{ stop: Function, start: Function, name: string }}
 */
function scheduleJob(name, expression, fn, options = {}) {
  if (!cron.validate(expression)) {
    throw new Error(`Invalid cron expression for job "${name}": ${expression}`);
  }

  if (scheduledJobs.has(name)) {
    throw new Error(`A job with name "${name}" is already scheduled.`);
  }

  const { wrap } = require('./cronwrap');
  const wrappedFn = wrap(name, fn, options);

  const task = cron.schedule(expression, wrappedFn, { scheduled: false });

  const job = {
    name,
    expression,
    start() {
      task.start();
      return this;
    },
    stop() {
      task.stop();
      scheduledJobs.delete(name);
      return this;
    },
    destroy() {
      task.destroy();
      scheduledJobs.delete(name);
    }
  };

  scheduledJobs.set(name, job);
  return job;
}

function getScheduledJob(name) {
  return scheduledJobs.get(name) || null;
}

function listScheduledJobs() {
  return Array.from(scheduledJobs.keys());
}

function stopAll() {
  for (const job of scheduledJobs.values()) {
    job.stop();
  }
}

module.exports = { scheduleJob, getScheduledJob, listScheduledJobs, stopAll };
