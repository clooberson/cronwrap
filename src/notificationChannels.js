// notificationChannels.js — built-in channel implementations (console, webhook)

const { createLogger } = require('./logger');

const log = createLogger('notifications');

function createConsoleChannel(options = {}) {
  const level = options.level || 'info';
  return async function consoleChannel(event) {
    const line = `[${event.timestamp}] [${event.status.toUpperCase()}] ${event.message}`;
    if (level === 'error') {
      console.error(line);
    } else {
      console.log(line);
    }
  };
}

function createWebhookChannel(url, options = {}) {
  if (!url) throw new Error('Webhook channel requires a URL');
  const method = options.method || 'POST';
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  return async function webhookChannel(event) {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error(`Webhook to ${url} failed with status ${response.status}`);
    }
    log.info(`Webhook delivered for job "${event.jobName}" → ${url}`);
  };
}

function createLogFileChannel(logger) {
  return async function logFileChannel(event) {
    const msg = `[${event.status.toUpperCase()}] ${event.message}`;
    if (event.status === 'failure' || event.status === 'timeout') {
      logger.error(msg);
    } else {
      logger.info(msg);
    }
  };
}

module.exports = { createConsoleChannel, createWebhookChannel, createLogFileChannel };
