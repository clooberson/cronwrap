const { withRateLimit } = require('./rateLimitMiddleware');
const { resetAllRateLimits } = require('./rateLimit');

beforeEach(() => {
  resetAllRateLimits();
});

describe('withRateLimit', () => {
  it('calls the job function when under the limit', async () => {
    const fn = jest.fn().mockResolvedValue('done');
    const wrapped = withRateLimit('jobA', fn, { maxRuns: 3, windowMs: 60000 });
    const result = await wrapped();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe('done');
  });

  it('skips the job when rate limit is exceeded', async () => {
    const fn = jest.fn().mockResolvedValue('done');
    const wrapped = withRateLimit('jobB', fn, { maxRuns: 2, windowMs: 60000 });
    await wrapped();
    await wrapped();
    const result = await wrapped();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.skipped).toBe(true);
    expect(result.reason).toMatch(/Rate limit exceeded/);
  });

  it('logs a warning via provided logger when skipped', async () => {
    const fn = jest.fn();
    const logger = { warn: jest.fn() };
    const wrapped = withRateLimit('jobC', fn, { maxRuns: 1, windowMs: 60000 }, { logger });
    await wrapped();
    await wrapped();
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toMatch(/jobC/);
  });

  it('calls alerter.send when skipped and alerter is provided', async () => {
    const fn = jest.fn();
    const alerter = { send: jest.fn().mockResolvedValue(true) };
    const wrapped = withRateLimit('jobD', fn, { maxRuns: 1, windowMs: 60000 }, { alerter });
    await wrapped();
    await wrapped();
    expect(alerter.send).toHaveBeenCalledTimes(1);
    expect(alerter.send.mock.calls[0][0]).toMatchObject({
      level: 'warn',
      job: 'jobD',
      type: 'rate_limit_exceeded'
    });
  });

  it('passes arguments through to the underlying function', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const wrapped = withRateLimit('jobE', fn, { maxRuns: 5, windowMs: 60000 });
    await wrapped('arg1', 42);
    expect(fn).toHaveBeenCalledWith('arg1', 42);
  });
});
