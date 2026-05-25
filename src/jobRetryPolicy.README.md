# Job Retry Policy

Define named retry policies and assign them to jobs. Policies control how many times a job is retried and how long to wait between attempts.

## Defining a Policy

```js
const { definePolicy } = require('./jobRetryPolicy');

definePolicy('aggressive', {
  maxAttempts: 5,
  backoffMs: 500,
  backoffMultiplier: 2,
  maxBackoffMs: 10000,
});
```

## Assigning a Policy to a Job

```js
const { assignPolicy } = require('./jobRetryPolicy');

assignPolicy('send-email', 'aggressive');
```

## Using the Middleware

```js
const { withRetryPolicy } = require('./jobRetryPolicyMiddleware');
const { createPipeline } = require('./middleware');

const run = createPipeline([
  withRetryPolicy('send-email'),
]);

await run(context, async () => {
  await sendEmail();
});
```

## Backoff Calculation

Backoff delay is calculated as:

```
delay = min(backoffMs * backoffMultiplier^(attempt-1), maxBackoffMs)
```

| Attempt | backoffMs=1000, multiplier=2 |
|---------|-----------------------------|
| 1       | 1000ms                      |
| 2       | 2000ms                      |
| 3       | 4000ms                      |

## Default Policy

If no policy is assigned to a job, the default policy is used:

- `maxAttempts`: 3
- `backoffMs`: 1000
- `backoffMultiplier`: 2
- `maxBackoffMs`: 30000
