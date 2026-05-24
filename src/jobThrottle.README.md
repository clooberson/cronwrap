# Job Throttle

Prevents a cron job from running more frequently than a configured interval, regardless of how often it is triggered.

## Why throttle?

Some jobs are expensive or have external rate limits (APIs, databases). Throttling ensures a minimum gap between runs even if the scheduler fires more often than expected.

## Usage

### Low-level API (`jobThrottle.js`)

```js
const { setThrottle, shouldThrottle, recordThrottledRun } = require('./jobThrottle');

setThrottle('syncInventory', 60_000); // at most once per minute

if (!shouldThrottle('syncInventory')) {
  await doSync();
  recordThrottledRun('syncInventory');
}
```

### Middleware wrapper (`jobThrottleMiddleware.js`)

```js
const { withThrottle } = require('./jobThrottleMiddleware');

const job = withThrottle('syncInventory', 60_000, async () => {
  await doSync();
});

// In your scheduler:
await job(); // runs
await job(); // skipped — too soon
```

When skipped, the wrapper logs a message and returns `{ skipped: true, jobName }`.

## API

| Function | Description |
|---|---|
| `setThrottle(name, intervalMs)` | Register throttle config for a job |
| `shouldThrottle(name)` | Returns `true` if the job should be skipped |
| `recordThrottledRun(name)` | Mark a successful run and reset skip counter |
| `recordSkip(name)` | Increment the skip counter |
| `getThrottleState(name)` | Get current throttle state object |
| `removeThrottle(name)` | Remove throttle config for a job |
| `clearAllThrottles()` | Reset all throttle state (useful in tests) |
| `listThrottles()` | List all registered job names |
