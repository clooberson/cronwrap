# jobQuota — Per-Job Run Quota

Enforce a maximum number of executions for a job within a rolling time window.

## Usage

```js
const { setQuota, checkQuota, recordQuotaRun, getQuotaState } = require('./jobQuota');

// Allow at most 10 runs per hour
setQuota('my-job', 10, 60 * 60 * 1000);

const result = checkQuota('my-job');
if (result.allowed) {
  recordQuotaRun('my-job');
  // ... run job
}
```

## Middleware

```js
const { withQuota } = require('./jobQuotaMiddleware');

const run = withQuota('my-job')(async (ctx) => {
  // job logic
});

await run(context);
```

If the quota is exceeded, the job is skipped and `context.skippedByQuota` is set to `true`.

## API

### `setQuota(jobId, limit, windowMs)`
Define a quota: `limit` max runs per `windowMs` milliseconds.

### `checkQuota(jobId) → { allowed, remaining, limit, windowMs }`
Check whether the job is allowed to run.

### `recordQuotaRun(jobId)`
Record that a run occurred (call after a successful check).

### `getQuotaState(jobId) → object | null`
Return current quota usage for a job.

### `removeQuota(jobId)`
Remove quota enforcement for a job.

### `resetAllQuotas()`
Clear all quota state (useful in tests).
