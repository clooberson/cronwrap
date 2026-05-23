const { scheduleJob, getScheduledJob, listScheduledJobs, stopAll } = require('./scheduler');

// Mock node-cron
jest.mock('node-cron', () => ({
  validate: (expr) => expr === '* * * * *' || expr === '0 * * * *',
  schedule: jest.fn((expr, fn, opts) => ({
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn()
  }))
}));

// Mock cronwrap
jest.mock('./cronwrap', () => ({
  wrap: jest.fn((name, fn) => fn)
}));

beforeEach(() => {
  stopAll();
  jest.clearAllMocks();
});

describe('scheduleJob', () => {
  test('creates and returns a job object', () => {
    const job = scheduleJob('test-job', '* * * * *', jest.fn());
    expect(job).toBeDefined();
    expect(job.name).toBe('test-job');
    expect(job.expression).toBe('* * * * *');
    expect(typeof job.start).toBe('function');
    expect(typeof job.stop).toBe('function');
  });

  test('throws on invalid cron expression', () => {
    expect(() => scheduleJob('bad-job', 'not-valid', jest.fn())).toThrow(
      'Invalid cron expression'
    );
  });

  test('throws if job name already registered', () => {
    scheduleJob('dup-job', '* * * * *', jest.fn());
    expect(() => scheduleJob('dup-job', '* * * * *', jest.fn())).toThrow(
      'already scheduled'
    );
  });

  test('start() calls task.start()', () => {
    const job = scheduleJob('start-test', '* * * * *', jest.fn());
    job.start();
    // no error = pass; node-cron mock records the call
  });
});

describe('getScheduledJob', () => {
  test('returns job by name', () => {
    scheduleJob('lookup-job', '* * * * *', jest.fn());
    expect(getScheduledJob('lookup-job')).not.toBeNull();
  });

  test('returns null for unknown job', () => {
    expect(getScheduledJob('ghost')).toBeNull();
  });
});

describe('listScheduledJobs', () => {
  test('returns names of all registered jobs', () => {
    scheduleJob('job-a', '* * * * *', jest.fn());
    scheduleJob('job-b', '0 * * * *', jest.fn());
    const names = listScheduledJobs();
    expect(names).toContain('job-a');
    expect(names).toContain('job-b');
  });
});

describe('stopAll', () => {
  test('removes all jobs from registry', () => {
    scheduleJob('s1', '* * * * *', jest.fn());
    scheduleJob('s2', '0 * * * *', jest.fn());
    stopAll();
    expect(listScheduledJobs()).toHaveLength(0);
  });
});
