const {
  createJobContext,
  startContext,
  finishContext,
  summarizeContext,
} = require('./jobContext');

describe('createJobContext', () => {
  it('creates a context with expected fields', () => {
    const ctx = createJobContext('myJob');
    expect(ctx.jobName).toBe('myJob');
    expect(ctx.runId).toMatch(/^myJob-/);
    expect(ctx.success).toBeNull();
    expect(ctx.error).toBeNull();
    expect(ctx.retryCount).toBe(0);
    expect(ctx.tags).toEqual([]);
    expect(ctx.metadata).toEqual({});
  });

  it('accepts metadata and tags via options', () => {
    const ctx = createJobContext('taggedJob', { tags: ['prod'], metadata: { env: 'production' } });
    expect(ctx.tags).toEqual(['prod']);
    expect(ctx.metadata.env).toBe('production');
  });
});

describe('startContext', () => {
  it('sets startedAt and startedAtMs', () => {
    const ctx = createJobContext('job1');
    const before = Date.now();
    startContext(ctx);
    const after = Date.now();
    expect(ctx.startedAt).not.toBeNull();
    expect(ctx.startedAtMs).toBeGreaterThanOrEqual(before);
    expect(ctx.startedAtMs).toBeLessThanOrEqual(after);
  });
});

describe('finishContext', () => {
  it('marks success and sets duration', () => {
    const ctx = createJobContext('job2');
    startContext(ctx);
    finishContext(ctx, { success: true });
    expect(ctx.success).toBe(true);
    expect(ctx.durationMs).toBeGreaterThanOrEqual(0);
    expect(ctx.finishedAt).not.toBeNull();
  });

  it('captures error and marks failure', () => {
    const ctx = createJobContext('job3');
    startContext(ctx);
    const err = new Error('something broke');
    finishContext(ctx, { error: err });
    expect(ctx.success).toBe(false);
    expect(ctx.error).toBe(err);
  });

  it('infers success from absence of error', () => {
    const ctx = createJobContext('job4');
    startContext(ctx);
    finishContext(ctx, {});
    expect(ctx.success).toBe(true);
  });
});

describe('summarizeContext', () => {
  it('returns a plain summary object', () => {
    const ctx = createJobContext('summaryJob', { tags: ['test'] });
    startContext(ctx);
    finishContext(ctx, { success: true });
    const summary = summarizeContext(ctx);
    expect(summary.jobName).toBe('summaryJob');
    expect(summary.success).toBe(true);
    expect(summary.error).toBeNull();
    expect(summary.tags).toEqual(['test']);
    expect(typeof summary.durationMs).toBe('number');
  });

  it('includes error message string in summary', () => {
    const ctx = createJobContext('errJob');
    startContext(ctx);
    finishContext(ctx, { error: new Error('oops') });
    const summary = summarizeContext(ctx);
    expect(summary.error).toBe('oops');
  });
});
