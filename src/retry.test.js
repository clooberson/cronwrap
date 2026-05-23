const { withRetry, getBackoffDelay } = require('./retry');

describe('getBackoffDelay', () => {
  it('returns baseDelay for attempt 1 with exponential', () => {
    expect(getBackoffDelay(1, { baseDelay: 1000, exponential: true })).toBe(1000);
  });

  it('doubles delay for each attempt with exponential backoff', () => {
    expect(getBackoffDelay(2, { baseDelay: 1000, exponential: true })).toBe(2000);
    expect(getBackoffDelay(3, { baseDelay: 1000, exponential: true })).toBe(4000);
  });

  it('returns flat baseDelay when exponential is false', () => {
    expect(getBackoffDelay(3, { baseDelay: 500, exponential: false })).toBe(500);
  });

  it('uses defaults when no options provided', () => {
    expect(getBackoffDelay(1)).toBe(1000);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelay: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds eventually', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = withRetry(fn, { maxAttempts: 3, baseDelay: 10 });
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws last error after all attempts exhausted', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    const promise = withRetry(fn, { maxAttempts: 3, baseDelay: 10 });
    await jest.runAllTimersAsync();

    await expect(promise).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('calls onRetry callback with attempt, error, and delay', async () => {
    const onRetry = jest.fn();
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('oops'))
      .mockResolvedValue('done');

    const promise = withRetry(fn, { maxAttempts: 3, baseDelay: 10, onRetry });
    await jest.runAllTimersAsync();
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), 10);
  });
});
