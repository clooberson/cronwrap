const { buildEvent, STATUSES } = require('./notificationEvent');

describe('STATUSES', () => {
  test('includes expected statuses', () => {
    expect(STATUSES).toEqual(expect.arrayContaining(['success', 'failure', 'retry', 'timeout']));
  });
});

describe('buildEvent', () => {
  test('builds a success event with defaults', () => {
    const event = buildEvent('my-job', 'success', { durationMs: 120 });
    expect(event.jobName).toBe('my-job');
    expect(event.status).toBe('success');
    expect(event.durationMs).toBe(120);
    expect(event.attempt).toBe(1);
    expect(event.error).toBeNull();
    expect(event.timestamp).toBeDefined();
    expect(event.message).toMatch(/my-job/);
    expect(event.message).toMatch(/120ms/);
  });

  test('builds a failure event with error', () => {
    const event = buildEvent('job2', 'failure', { error: 'DB timeout' });
    expect(event.status).toBe('failure');
    expect(event.error).toBe('DB timeout');
    expect(event.message).toMatch(/DB timeout/);
  });

  test('builds a retry event with attempt number', () => {
    const event = buildEvent('job3', 'retry', { attempt: 3 });
    expect(event.attempt).toBe(3);
    expect(event.message).toMatch(/attempt 3/);
  });

  test('builds a timeout event', () => {
    const event = buildEvent('job4', 'timeout', { durationMs: 5000 });
    expect(event.message).toMatch(/5000ms/);
  });

  test('allows custom message override', () => {
    const event = buildEvent('job5', 'success', { message: 'All good!' });
    expect(event.message).toBe('All good!');
  });

  test('throws for invalid status', () => {
    expect(() => buildEvent('job', 'unknown')).toThrow('Invalid status');
  });
});
