const {
  setStatus,
  getStatus,
  isRunning,
  getJobsByStatus,
  clearStatus,
  clearAllStatuses,
} = require('./jobStatus');

const { withJobStatus } = require('./jobStatusMiddleware');

beforeEach(() => clearAllStatuses());

describe('jobStatus', () => {
  test('new job starts as idle', () => {
    const s = getStatus('job-a');
    expect(s.status).toBe('idle');
    expect(s.lastUpdated).toBeNull();
    expect(s.lastError).toBeNull();
  });

  test('setStatus updates status and timestamp', () => {
    const s = setStatus('job-a', 'running');
    expect(s.status).toBe('running');
    expect(s.lastUpdated).not.toBeNull();
  });

  test('setStatus stores error message on failure', () => {
    const s = setStatus('job-a', 'failed', new Error('boom'));
    expect(s.status).toBe('failed');
    expect(s.lastError).toBe('Error: boom');
  });

  test('setStatus throws on invalid status', () => {
    expect(() => setStatus('job-a', 'unknown')).toThrow('Invalid status');
  });

  test('isRunning returns true only when running', () => {
    expect(isRunning('job-b')).toBe(false);
    setStatus('job-b', 'running');
    expect(isRunning('job-b')).toBe(true);
    setStatus('job-b', 'success');
    expect(isRunning('job-b')).toBe(false);
  });

  test('getJobsByStatus filters correctly', () => {
    setStatus('job-1', 'success');
    setStatus('job-2', 'failed');
    setStatus('job-3', 'success');
    expect(getJobsByStatus('success').sort()).toEqual(['job-1', 'job-3']);
    expect(getJobsByStatus('failed')).toEqual(['job-2']);
  });

  test('clearStatus removes a single job', () => {
    setStatus('job-x', 'success');
    clearStatus('job-x');
    expect(getStatus('job-x').status).toBe('idle');
  });
});

describe('withJobStatus middleware', () => {
  test('sets running then success around successful job', async () => {
    const states = [];
    const middleware = withJobStatus('mw-job');
    await middleware({}, async () => {
      states.push(require('./jobStatus').getStatus('mw-job').status);
    });
    expect(states).toEqual(['running']);
    expect(require('./jobStatus').getStatus('mw-job').status).toBe('success');
  });

  test('sets failed status when job throws', async () => {
    const middleware = withJobStatus('mw-fail');
    await expect(
      middleware({}, async () => { throw new Error('oops'); })
    ).rejects.toThrow('oops');
    expect(require('./jobStatus').getStatus('mw-fail').status).toBe('failed');
  });

  test('skips execution if job already running', async () => {
    setStatus('mw-dup', 'running');
    let ran = false;
    const middleware = withJobStatus('mw-dup');
    await middleware({}, async () => { ran = true; });
    expect(ran).toBe(false);
  });

  test('allowConcurrent bypasses running guard', async () => {
    setStatus('mw-con', 'running');
    let ran = false;
    const middleware = withJobStatus('mw-con', { allowConcurrent: true });
    await middleware({}, async () => { ran = true; });
    expect(ran).toBe(true);
  });
});
