# jobTimeout

Per-job timeout enforcement for cronwrap. Wraps any async job function and rejects if it runs longer than the configured limit.

## API

### `setTimeout(jobName, ms)`
Register a timeout (in milliseconds) for a job.

```js
const { setTimeout } = require('./jobTimeout');
setTimeout('cleanup', 5000); // 5 second limit
```

### `getTimeout(jobName) → number | null`
Retrieve the registered timeout for a job. Returns `null` if none set.

### `removeTimeout(jobName) → boolean`
Remove a job's timeout registration.

### `clearAllTimeouts()`
Clear all registered timeouts (useful in tests).

### `listTimeouts() → Array<{ name, ms }>`
List all registered timeouts.

### `withTimeout(jobName, fn) → Function`
Wrap a job function with its registered timeout. If no timeout is set for the job, the original function is returned unchanged.

```js
const { withTimeout } = require('./jobTimeout');

const safeFn = withTimeout('cleanup', async () => {
  await doExpensiveWork();
});

// Will throw: Job "cleanup" timed out after 5000ms
await safeFn();
```

## Integration

Use `withTimeout` alongside `withRateLimit` or inside a middleware pipeline via `createPipeline` for full job lifecycle control.
