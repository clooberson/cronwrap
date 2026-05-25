// jobCheckpointMiddleware.js — middleware that auto-saves start/end checkpoints

const { saveCheckpoint, clearCheckpoints } = require('./jobCheckpoint');

/**
 * Wraps a job function to automatically record start and finish checkpoints.
 * Also clears previous checkpoints before each run.
 *
 * @param {string} jobId
 * @param {Function} fn - async job function
 * @returns {Function}
 */
function withCheckpoints(jobId, fn) {
  return async function (...args) {
    clearCheckpoints(jobId);
    saveCheckpoint(jobId, 'start', { args: args.length });

    let result;
    try {
      result = await fn(...args);
      saveCheckpoint(jobId, 'finish', { success: true });
    } catch (err) {
      saveCheckpoint(jobId, 'error', { message: err.message });
      throw err;
    }

    return result;
  };
}

module.exports = { withCheckpoints };
