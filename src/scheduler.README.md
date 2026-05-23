# Scheduler Module

The scheduler module provides a convenient way to register, start, and stop cron jobs built on top of `node-cron` and `cronwrap`.

## API

### `scheduleJob(name, expression, fn, options?)`

Registers a new cron job.

| Param | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique identifier for the job |
| `expression` | `string` | Standard cron expression (e.g. `'0 * * * *'`) |
| `fn` | `Function` | The job handler (sync or async) |
| `options` | `object` | Optional `cronwrap` options (retries, timeout, alerting…) |

Returns a **job handle** with:
- `.start()` — starts the schedule
- `.stop()` — stops the schedule and removes it from the registry
- `.destroy()` — destroys the underlying task

Throws if the cron expression is invalid or the name is already registered.

### `getScheduledJob(name)` → job | null

Looks up a registered job by name.

### `listScheduledJobs()` → string[]

Returns the names of all currently registered jobs.

### `stopAll()`

Stops and unregisters every scheduled job. Useful for graceful shutdown.

---

## `loadScheduleConfig(definitions)`

Bulk-register jobs from an array of definition objects:

```js
const { loadScheduleConfig } = require('./scheduleConfig');

loadScheduleConfig([
  {
    name: 'cleanup',
    expression: '0 2 * * *',
    handler: require('./jobs/cleanup'),
    options: { retries: 2, timeoutMs: 30_000 }
  }
]);
```

Each definition must include `name`, `expression`, and `handler`. `options` is optional.
