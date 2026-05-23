/**
 * jobContext.js
 * Provides a context object passed through the middleware pipeline for each job run.
 * Tracks job name, run metadata, timing, and any errors encountered.
 */

function createJobContext(jobName, options = {}) {
  return {
    jobName,
    runId: `${jobName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: null,
    finishedAt: null,
    durationMs: null,
    success: null,
    error: null,
    retryCount: 0,
    metadata: options.metadata || {},
    tags: options.tags || [],
    result: undefined,
  };
}

function startContext(ctx) {
  ctx.startedAt = new Date().toISOString();
  ctx.startedAtMs = Date.now();
  return ctx;
}

function finishContext(ctx, { success, error, result } = {}) {
  ctx.finishedAt = new Date().toISOString();
  ctx.durationMs = Date.now() - ctx.startedAtMs;
  ctx.success = success !== undefined ? success : !error;
  ctx.error = error || null;
  ctx.result = result !== undefined ? result : ctx.result;
  return ctx;
}

function summarizeContext(ctx) {
  return {
    jobName: ctx.jobName,
    runId: ctx.runId,
    startedAt: ctx.startedAt,
    finishedAt: ctx.finishedAt,
    durationMs: ctx.durationMs,
    success: ctx.success,
    retryCount: ctx.retryCount,
    error: ctx.error ? ctx.error.message || String(ctx.error) : null,
    tags: ctx.tags,
  };
}

module.exports = { createJobContext, startContext, finishContext, summarizeContext };
