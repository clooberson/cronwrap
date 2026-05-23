// notificationEvent.js — build structured notification events from job run results

const STATUSES = ['success', 'failure', 'retry', 'timeout'];

function buildEvent(jobName, status, details = {}) {
  if (!STATUSES.includes(status)) {
    throw new Error(`Invalid status "${status}". Must be one of: ${STATUSES.join(', ')}`);
  }

  return {
    jobName,
    status,
    timestamp: new Date().toISOString(),
    durationMs: details.durationMs ?? null,
    attempt: details.attempt ?? 1,
    error: details.error ?? null,
    message: details.message ?? buildDefaultMessage(jobName, status, details),
  };
}

function buildDefaultMessage(jobName, status, details) {
  switch (status) {
    case 'success':
      return `Job "${jobName}" completed successfully in ${details.durationMs ?? '?'}ms.`;
    case 'failure':
      return `Job "${jobName}" failed: ${details.error ?? 'unknown error'}.`;
    case 'retry':
      return `Job "${jobName}" is retrying (attempt ${details.attempt ?? '?'}).`;
    case 'timeout':
      return `Job "${jobName}" timed out after ${details.durationMs ?? '?'}ms.`;
    default:
      return `Job "${jobName}" status: ${status}.`;
  }
}

module.exports = { buildEvent, STATUSES };
