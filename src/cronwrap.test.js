const { cronwrap } = require('./cronwrap');

describe('cronwrap', () => {
  it('runs a successful job and returns its result', async () => {
    const job = cronwrap(async () => 'done', { name: 'test-success' });
    const result = await job();
    expect(result).toBe('done');
  });

  it('calls onSuccess callback after a successful run', async () => {
    const onSuccess = jest.fn();
    const job = cronwrap(async () => {}, { name: 'test-cb', onSuccess });
    await job();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toMatchObject({ name: 'test-cb', attempt: 1 });
  });

  it('throws if job fails with no retries configured', async () => {
    const failing = async () => { throw new Error('boom'); };
    const job = cronwrap(failing, { name: 'test-fail' });
    await expect(job()).rejects.toThrow('boom');
  });

  it('retries the specified number of times before failing', async () => {
    let calls = 0;
    const failing = async () => {
      calls++;
      throw new Error('fail');
    };
    const job = cronwrap(failing, { name: 'test-retry', retries: 2, retryDelay: 0 });
    await expect(job()).rejects.toThrow('fail');
    expect(calls).toBe(3); // 1 initial + 2 retries
  });

  it('succeeds on a later retry attempt', async () => {
    let calls = 0;
    const flakyJob = async () => {
      calls++;
      if (calls < 3) throw new Error('not yet');
      return 'eventually';
    };
    const job = cronwrap(flakyJob, { name: 'test-flaky', retries: 3, retryDelay: 0 });
    const result = await job();
    expect(result).toBe('eventually');
    expect(calls).toBe(3);
  });

  it('calls onError callback with error details on final failure', async () => {
    const onError = jest.fn();
    const job = cronwrap(async () => { throw new Error('fatal'); }, {
      name: 'test-onerror',
      retries: 1,
      retryDelay: 0,
      onError,
    });
    await expect(job()).rejects.toThrow('fatal');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({ name: 'test-onerror', attempts: 2 });
  });
});
