const { withRetryPolicy } = require('./jobRetryPolicyMiddleware');
const { definePolicy, assignPolicy, clearAll } = require('./jobRetryPolicy');

beforeEach(() => clearAll());

function makeContext() {
  return { jobId: 'test-job' };
}

test('calls next once on success', async () => {
  assignPolicy || definePolicy('quick', { maxAttempts: 3, backoffMs: 0 });
  definePolicy('quick', { maxAttempts: 3, backoffMs: 0 });
  assignPolicy('job-a', 'quick');

  const middleware = withRetryPolicy('job-a');
  const ctx = makeContext();
  let calls = 0;
  await middleware(ctx, async () => { calls++; });
  expect(calls).toBe(1);
  expect(ctx.attempt).toBe(1);
  expect(ctx.attempts).toBe(1);
});

test('retries on failure and succeeds eventually', async () => {
  definePolicy('retry3', { maxAttempts: 3, backoffMs: 0, backoffMultiplier: 1, maxBackoffMs: 0 });
  assignPolicy('job-b', 'retry3');

  const middleware = withRetryPolicy('job-b');
  const ctx = makeContext();
  let calls = 0;
  await middleware(ctx, async () => {
    calls++;
    if (calls < 3) throw new Error('not yet');
  });
  expect(calls).toBe(3);
  expect(ctx.attempts).toBe(3);
});

test('throws after exhausting all attempts', async () => {
  definePolicy('fail2', { maxAttempts: 2, backoffMs: 0, backoffMultiplier: 1, maxBackoffMs: 0 });
  assignPolicy('job-c', 'fail2');

  const middleware = withRetryPolicy('job-c');
  const ctx = makeContext();
  await expect(
    middleware(ctx, async () => { throw new Error('always fails'); })
  ).rejects.toThrow('always fails');
  expect(ctx.failed).toBe(true);
  expect(ctx.attempts).toBe(2);
});

test('uses default policy for unassigned job', async () => {
  const middleware = withRetryPolicy('unassigned-job');
  const ctx = makeContext();
  let calls = 0;
  await middleware(ctx, async () => { calls++; });
  expect(calls).toBe(1);
  expect(ctx.policy.name).toBe('default');
});

test('sets lastRetryError on context after failure', async () => {
  definePolicy('one', { maxAttempts: 2, backoffMs: 0, backoffMultiplier: 1, maxBackoffMs: 0 });
  assignPolicy('job-d', 'one');

  const middleware = withRetryPolicy('job-d');
  const ctx = makeContext();
  await expect(
    middleware(ctx, async () => { throw new Error('boom'); })
  ).rejects.toThrow();
  expect(ctx.lastRetryError).toBe('boom');
});
