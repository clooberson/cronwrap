const { withThrottle } = require('./jobThrottleMiddleware');
const { clearAllThrottles, getThrottleState } = require('./jobThrottle');

beforeEach(() => {
  clearAllThrottles();
});

test('runs the job on first call', async () => {
  const fn = jest.fn().mockResolvedValue('done');
  const wrapped = withThrottle('jobA', 5000, fn);
  const result = await wrapped();
  expect(fn).toHaveBeenCalledTimes(1);
  expect(result).toBe('done');
});

test('skips the job if called again within interval', async () => {
  const fn = jest.fn().mockResolvedValue('done');
  const wrapped = withThrottle('jobB', 60000, fn);
  await wrapped();
  const result = await wrapped();
  expect(fn).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ skipped: true, jobName: 'jobB' });
});

test('increments skippedCount on throttled calls', async () => {
  const fn = jest.fn().mockResolvedValue('ok');
  const wrapped = withThrottle('jobC', 60000, fn);
  await wrapped();
  await wrapped();
  await wrapped();
  const state = getThrottleState('jobC');
  expect(state.skippedCount).toBe(2);
});

test('allows run again after interval expires', async () => {
  const fn = jest.fn().mockResolvedValue('ok');
  const wrapped = withThrottle('jobD', 10, fn);
  await wrapped();
  await new Promise((r) => setTimeout(r, 20));
  await wrapped();
  expect(fn).toHaveBeenCalledTimes(2);
});

test('passes arguments through to the job function', async () => {
  const fn = jest.fn().mockResolvedValue('result');
  const wrapped = withThrottle('jobE', 5000, fn);
  await wrapped('arg1', 42);
  expect(fn).toHaveBeenCalledWith('arg1', 42);
});

test('records lastRunAt after a successful run', async () => {
  const fn = jest.fn().mockResolvedValue(null);
  const wrapped = withThrottle('jobF', 5000, fn);
  const before = Date.now();
  await wrapped();
  const state = getThrottleState('jobF');
  expect(state.lastRunAt).toBeGreaterThanOrEqual(before);
});
