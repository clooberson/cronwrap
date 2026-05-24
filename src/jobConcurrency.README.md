# Job Concurrency

Controls how many instances of a job can run simultaneously.

## Core module: `jobConcurrency.js`

```js
const { setConcurrencyLimit, canRun, acquireSlot, releaseSlot } = require('./jobConcurrency');

setConcurrencyLimit('myJob', 2); // allow up to 2 concurrent runs
```

## Middleware: `jobConcurrencyMiddleware.js`

```js
const { withConcurrency } = require('./jobConcurrencyMiddleware');

// Skip if limit reached (default behaviour)
await withConcurrency('myJob', async () => {
  // job logic
}, { limit: 2 });

// Queue and wait for a slot (up to 5 seconds)
await withConcurrency('myJob', async () => {
  // job logic
}, { limit: 2, queue: true, queueTimeout: 5000 });
```

## Options

| Option         | Type    | Default | Description                                |
|----------------|---------|---------|--------------------------------------------|
| `limit`        | number  | `1`     | Max concurrent runs allowed                |
| `queue`        | boolean | `false` | Wait for a free slot instead of skipping   |
| `queueTimeout` | number  | `5000`  | Max ms to wait for a slot (queue mode)     |

## State shape

```js
{
  limit: 2,    // max allowed concurrent runs
  running: 1,  // currently running
  queued: 0,   // waiting for a slot
}
```

## Notes

- Slots are always released, even if the job throws.
- In queue mode, if the timeout expires the promise rejects with a descriptive error.
- Use `resetAllConcurrency()` in tests to reset state between runs.
