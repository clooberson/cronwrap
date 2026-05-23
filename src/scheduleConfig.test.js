const { loadScheduleConfig } = require('./scheduleConfig');
const { stopAll, listScheduledJobs } = require('./scheduler');

jest.mock('node-cron', () => ({
  validate: () => true,
  schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), destroy: jest.fn() }))
}));

jest.mock('./cronwrap', () => ({
  wrap: jest.fn((name, fn) => fn)
}));

beforeEach(() => {
  stopAll();
  jest.clearAllMocks();
});

describe('loadScheduleConfig', () => {
  const makeHandler = () => jest.fn();

  test('registers and starts all valid job definitions', () => {
    const defs = [
      { name: 'job1', expression: '* * * * *', handler: makeHandler() },
      { name: 'job2', expression: '0 * * * *', handler: makeHandler() }
    ];
    const jobs = loadScheduleConfig(defs);
    expect(jobs).toHaveLength(2);
    expect(listScheduledJobs()).toContain('job1');
    expect(listScheduledJobs()).toContain('job2');
  });

  test('throws if definitions is not an array', () => {
    expect(() => loadScheduleConfig(null)).toThrow('must be an array');
    expect(() => loadScheduleConfig({ name: 'x' })).toThrow('must be an array');
  });

  test('throws if name is missing', () => {
    expect(() =>
      loadScheduleConfig([{ expression: '* * * * *', handler: makeHandler() }])
    ).toThrow('"name"');
  });

  test('throws if expression is missing', () => {
    expect(() =>
      loadScheduleConfig([{ name: 'no-expr', handler: makeHandler() }])
    ).toThrow('"expression"');
  });

  test('throws if handler is not a function', () => {
    expect(() =>
      loadScheduleConfig([{ name: 'bad-handler', expression: '* * * * *', handler: 'oops' }])
    ).toThrow('"handler"');
  });

  test('passes options through to scheduleJob', () => {
    const { wrap } = require('./cronwrap');
    const handler = makeHandler();
    loadScheduleConfig([{
      name: 'opts-job',
      expression: '* * * * *',
      handler,
      options: { retries: 3 }
    }]);
    expect(wrap).toHaveBeenCalledWith('opts-job', handler, { retries: 3 });
  });
});
