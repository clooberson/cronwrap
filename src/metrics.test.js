const {
  recordRun,
  getMetrics,
  resetMetrics,
  averageDurationMs,
  successRate,
} = require('./metrics');

beforeEach(() => {
  resetMetrics();
});

describe('recordRun', () => {
  test('increments run count', () => {
    recordRun('myJob', 100);
    expect(getMetrics('myJob').runs).toBe(1);
  });

  test('tracks failures separately', () => {
    recordRun('myJob', 200, true);
    recordRun('myJob', 150, false);
    const m = getMetrics('myJob');
    expect(m.runs).toBe(2);
    expect(m.failures).toBe(1);
  });

  test('records lastRunAt as ISO string', () => {
    recordRun('myJob', 50);
    expect(getMetrics('myJob').lastRunAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  test('accumulates totalDurationMs', () => {
    recordRun('myJob', 100);
    recordRun('myJob', 200);
    expect(getMetrics('myJob').totalDurationMs).toBe(300);
  });
});

describe('averageDurationMs', () => {
  test('returns 0 when no runs', () => {
    expect(averageDurationMs('newJob')).toBe(0);
  });

  test('calculates correct average', () => {
    recordRun('myJob', 100);
    recordRun('myJob', 300);
    expect(averageDurationMs('myJob')).toBe(200);
  });
});

describe('successRate', () => {
  test('returns null when no runs', () => {
    expect(successRate('newJob')).toBeNull();
  });

  test('returns 100 when no failures', () => {
    recordRun('myJob', 100);
    expect(successRate('myJob')).toBe(100);
  });

  test('returns correct rate with failures', () => {
    recordRun('myJob', 100, true);
    recordRun('myJob', 100, false);
    recordRun('myJob', 100, false);
    recordRun('myJob', 100, false);
    expect(successRate('myJob')).toBe(75);
  });
});

describe('resetMetrics', () => {
  test('resets a single job', () => {
    recordRun('myJob', 100);
    resetMetrics('myJob');
    expect(getMetrics('myJob').runs).toBe(0);
  });

  test('resets all jobs', () => {
    recordRun('jobA', 100);
    recordRun('jobB', 200);
    resetMetrics();
    expect(getMetrics('jobA').runs).toBe(0);
    expect(getMetrics('jobB').runs).toBe(0);
  });
});
