const { createAlerter } = require('./alerting');

describe('createAlerter', () => {
  it('calls onFailure when a failure is recorded', async () => {
    const onFailure = jest.fn();
    const alerter = createAlerter({ onFailure });

    await alerter.recordFailure(new Error('boom'), { jobName: 'test-job' });

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
        consecutiveFailures: 1,
        jobName: 'test-job',
      })
    );
  });

  it('respects threshold before alerting', async () => {
    const onFailure = jest.fn();
    const alerter = createAlerter({ onFailure, threshold: 3 });

    await alerter.recordFailure(new Error('fail 1'));
    await alerter.recordFailure(new Error('fail 2'));
    expect(onFailure).not.toHaveBeenCalled();

    await alerter.recordFailure(new Error('fail 3'));
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onFailure.mock.calls[0][0].consecutiveFailures).toBe(3);
  });

  it('calls onSuccess after recovery from alerted failure', async () => {
    const onFailure = jest.fn();
    const onSuccess = jest.fn();
    const alerter = createAlerter({ onFailure, onSuccess });

    await alerter.recordFailure(new Error('oops'));
    await alerter.recordSuccess({ jobName: 'test-job' });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ jobName: 'test-job' });
  });

  it('does not call onSuccess if there was no alerted failure', async () => {
    const onSuccess = jest.fn();
    const alerter = createAlerter({ onSuccess });

    await alerter.recordSuccess({ jobName: 'clean-job' });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('resets consecutive failure count after success', async () => {
    const alerter = createAlerter({});

    await alerter.recordFailure(new Error('err1'));
    await alerter.recordFailure(new Error('err2'));
    expect(alerter.getConsecutiveFailures()).toBe(2);

    await alerter.recordSuccess();
    expect(alerter.getConsecutiveFailures()).toBe(0);
  });

  it('reset() clears state', async () => {
    const alerter = createAlerter({});
    await alerter.recordFailure(new Error('err'));
    alerter.reset();
    expect(alerter.getConsecutiveFailures()).toBe(0);
  });
});
