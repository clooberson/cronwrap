# Middleware

The middleware system lets you compose reusable hooks around any cron job execution.

## Core concepts

- **Middleware** — an `async (ctx, next)` function. Call `next()` to pass control forward.
- **Context (`ctx`)** — a plain object shared across all middlewares and the job itself.
- **Pipeline** — an ordered list of middlewares + the job, run in sequence.

## Built-in middlewares

### `timingMiddleware`
Adds `startedAt`, `finishedAt`, and `durationMs` to the context.

### `errorCaptureMiddleware`
Wraps execution in try/catch. Sets `ctx.success` (boolean) and `ctx.error` (if thrown).

## Usage

```js
const { createPipeline, timingMiddleware, errorCaptureMiddleware } = require('./middleware');

const myJob = async (ctx) => {
  console.log('running job');
};

const run = createPipeline(
  [errorCaptureMiddleware, timingMiddleware],
  myJob
);

const ctx = { jobName: 'my-job' };
await run(ctx);
console.log(`Done in ${ctx.durationMs}ms, success: ${ctx.success}`);
```

## Global Registry

Use `middlewareRegistry` to register middlewares that apply across all jobs:

```js
const { registerMiddleware, getAllMiddlewares } = require('./middlewareRegistry');

registerMiddleware('timing', timingMiddleware);
registerMiddleware('errors', errorCaptureMiddleware);

// later, when building a pipeline:
const globalMws = getAllMiddlewares();
const run = createPipeline([...globalMws, ...jobSpecificMws], myJob);
```

## Writing custom middleware

```js
async function loggingMiddleware(ctx, next) {
  console.log(`[${ctx.jobName}] starting`);
  await next();
  console.log(`[${ctx.jobName}] finished`);
}
```
