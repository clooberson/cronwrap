const { withConcurrency } = require('./jobConcurrencyMiddleware');
const { resetAllConcurrency, getConcurrencyState } = require('./jobConcurrency');

beforeEach(() => resetAllConcurrency());

test('runs a job normally when under limit', async () => {
  const result = await withConcurrency('jobA', async () => 'done', { limit: 2 });
  expect(result).toBe('done');
});

test('releases slot after job completes', async () => {
  await withConcurrency('jobA', async () => 'ok', { limit: 1 });
  expect(getConcurrencyState('jobA').running).toBe(0);
});

test('releases slot even if job throws', async () => {
  await expect(
    withConcurrency('jobA', async () => { throw new Error('boom'); }, { limit: 1 })
  ).rejects.toThrow('boom');
  expect(getConcurrencyState('jobA').running).toBe(0);
});

test('skips job when at limit and queue is false', async () => {
  // Manually hold a slot
  const { acquireSlot } = require('./jobConcurrency');
  const { setConcurrencyLimit } = require('./jobConcurrency');
  setConcurrencyLimit('jobB', 1);
  acquireSlot('jobB');

  const result = await withConcurrency('jobB', async () => 'should not run', { limit: 1, queue: false });
  expect(result.skipped).toBe(true);
  expect(result.reason).toBe('concurrency_limit_reached');
});

test('queues job and runs when slot becomes free', async () => {
  const { acquireSlot, releaseSlot, setConcurrencyLimit } = require('./jobConcurrency');
  setConcurrencyLimit('jobC', 1);
  acquireSlot('jobC');

  // Release the slot after a short delay
  setTimeout(() => releaseSlot('jobC'), 100);

  const result = await withConcurrency('jobC', async () => 'queued-done', {
    limit: 1,
    queue: true,
    queueTimeout: 1000,
  });
  expect(result).toBe('queued-done');
});

test('rejects queued job after timeout', async () => {
  const { acquireSlot, setConcurrencyLimit } = require('./jobConcurrency');
  setConcurrencyLimit('jobD', 1);
  acquireSlot('jobD'); // never released

  await expect(
    withConcurrency('jobD', async () => 'nope', { limit: 1, queue: true, queueTimeout: 150 })
  ).rejects.toThrow('timed out waiting for concurrency slot');
}, 2000);
