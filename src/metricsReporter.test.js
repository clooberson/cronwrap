const { formatJobReport, formatAllReports, printReport } = require('./metricsReporter');
const { recordRun, resetMetrics } = require('./metrics');

beforeEach(() => {
  resetMetrics();
});

describe('formatJobReport', () => {
  test('includes job name in header', () => {
    recordRun('syncJob', 120);
    const report = formatJobReport('syncJob');
    expect(report).toContain('syncJob');
  });

  test('shows correct run count', () => {
    recordRun('syncJob', 100);
    recordRun('syncJob', 200);
    expect(formatJobReport('syncJob')).toContain('Total Runs    : 2');
  });

  test('shows failure count', () => {
    recordRun('syncJob', 100, true);
    expect(formatJobReport('syncJob')).toContain('Failures      : 1');
  });

  test('shows N/A for last duration when no runs on fresh job', () => {
    const report = formatJobReport('freshJob');
    expect(report).toContain('Last Duration : N/A');
  });

  test('shows last duration in ms after a run', () => {
    recordRun('syncJob', 350);
    expect(formatJobReport('syncJob')).toContain('Last Duration : 350ms');
  });
});

describe('formatAllReports', () => {
  test('returns placeholder when no metrics exist', () => {
    expect(formatAllReports()).toBe('No metrics recorded yet.');
  });

  test('includes all job names when multiple jobs recorded', () => {
    recordRun('jobA', 100);
    recordRun('jobB', 200);
    const report = formatAllReports();
    expect(report).toContain('jobA');
    expect(report).toContain('jobB');
  });
});

describe('printReport', () => {
  test('calls logger.log with the report', () => {
    recordRun('myJob', 100);
    const mockLogger = { log: jest.fn() };
    printReport('myJob', mockLogger);
    expect(mockLogger.log).toHaveBeenCalledTimes(1);
    expect(mockLogger.log.mock.calls[0][0]).toContain('myJob');
  });

  test('prints all reports when no jobName given', () => {
    recordRun('jobA', 100);
    recordRun('jobB', 200);
    const mockLogger = { log: jest.fn() };
    const result = printReport(undefined, mockLogger);
    expect(result).toContain('jobA');
    expect(result).toContain('jobB');
  });
});
