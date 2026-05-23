const {
  compose,
  createPipeline,
  timingMiddleware,
  errorCaptureMiddleware,
} = require('./middleware');

describe('compose', () => {
  it('runs middlewares in order', async () => {
    const order = [];
    const mw1 = async (ctx, next) => { order.push(1); await next(); order.push(4); };
    const mw2 = async (ctx, next) => { order.push(2); await next(); order.push(3); };
    const handler = compose([mw1, mw2]);
    await handler({});
    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('passes context through', async () => {
    const mw = async (ctx, next) => { ctx.touched = true; await next(); };
    const ctx = {};
    await compose([mw])(ctx);
    expect(ctx.touched).toBe(true);
  });

  it('throws if next() called twice', async () => {
    const bad = async (ctx, next) => { await next(); await next(); };
    await expect(compose([bad])({})).rejects.toThrow('next() called multiple times');
  });
});

describe('createPipeline', () => {
  it('runs job and stores result on context', async () => {
    const job = async () => 42;
    const run = createPipeline([], job);
    const ctx = {};
    await run(ctx);
    expect(ctx.result).toBe(42);
  });

  it('runs middlewares before job', async () => {
    const log = [];
    const mw = async (ctx, next) => { log.push('before'); await next(); log.push('after'); };
    const job = async () => { log.push('job'); };
    await createPipeline([mw], job)({});
    expect(log).toEqual(['before', 'job', 'after']);
  });
});

describe('timingMiddleware', () => {
  it('sets startedAt, finishedAt, durationMs', async () => {
    const ctx = {};
    await timingMiddleware(ctx, async () => {});
    expect(typeof ctx.startedAt).toBe('number');
    expect(typeof ctx.finishedAt).toBe('number');
    expect(ctx.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe('errorCaptureMiddleware', () => {
  it('sets success=true when no error', async () => {
    const ctx = {};
    await errorCaptureMiddleware(ctx, async () => {});
    expect(ctx.success).toBe(true);
    expect(ctx.error).toBeUndefined();
  });

  it('captures error and sets success=false', async () => {
    const ctx = {};
    const err = new Error('boom');
    await errorCaptureMiddleware(ctx, async () => { throw err; });
    expect(ctx.success).toBe(false);
    expect(ctx.error).toBe(err);
  });
});
