const {
  recordHistory,
  getHistory,
  getLastRun,
  clearHistory,
  summarizeHistory
} = require('./history');
const { formatHistoryReport, formatLastRun } = require('./historyReporter');

beforeEach(() => clearHistory());

describe('recordHistory / getHistory', () => {
  test('records a successful run', () => {
    recordHistory('job-a', { status: 'success', durationMs: 120 });
    const history = getHistory('job-a');
    expect(history).toHaveLength(1);
    expect(history[0].status).toBe('success');
    expect(history[0].durationMs).toBe(120);
    expect(history[0].error).toBeNull();
  });

  test('records a failed run with error', () => {
    recordHistory('job-b', { status: 'failure', durationMs: 50, error: new Error('boom') });
    const entry = getHistory('job-b')[0];
    expect(entry.status).toBe('failure');
    expect(entry.error).toBe('Error: boom');
  });

  test('caps entries at maxEntries', () => {
    for (let i = 0; i < 5; i++) {
      recordHistory('capped', { status: 'success', durationMs: i }, 3);
    }
    expect(getHistory('capped')).toHaveLength(3);
    expect(getHistory('capped')[0].durationMs).toBe(2);
  });

  test('returns empty array for unknown job', () => {
    expect(getHistory('ghost')).toEqual([]);
  });
});

describe('getLastRun', () => {
  test('returns the most recent entry', () => {
    recordHistory('job-c', { status: 'success', durationMs: 10 });
    recordHistory('job-c', { status: 'failure', durationMs: 20, error: 'oops' });
    expect(getLastRun('job-c').status).toBe('failure');
  });

  test('returns null when no history', () => {
    expect(getLastRun('nobody')).toBeNull();
  });
});

describe('summarizeHistory', () => {
  test('computes correct summary', () => {
    recordHistory('job-d', { status: 'success', durationMs: 100 });
    recordHistory('job-d', { status: 'success', durationMs: 200 });
    recordHistory('job-d', { status: 'failure', durationMs: 50 });
    const s = summarizeHistory('job-d');
    expect(s.totalRuns).toBe(3);
    expect(s.successes).toBe(2);
    expect(s.failures).toBe(1);
    expect(s.avgDurationMs).toBe(117);
  });

  test('returns null for unknown job', () => {
    expect(summarizeHistory('missing')).toBeNull();
  });
});

describe('formatHistoryReport', () => {
  test('includes summary line and entries', () => {
    recordHistory('job-e', { status: 'success', durationMs: 80 });
    const report = formatHistoryReport('job-e');
    expect(report).toContain('job-e');
    expect(report).toContain('success');
    expect(report).toContain('80ms');
  });

  test('respects limit option', () => {
    for (let i = 0; i < 5; i++) recordHistory('job-f', { status: 'success', durationMs: i * 10 });
    const report = formatHistoryReport('job-f', { limit: 2 });
    const lines = report.split('\n').filter(l => l.startsWith('  ['));
    expect(lines).toHaveLength(2);
  });
});

describe('formatLastRun', () => {
  test('formats the last run', () => {
    recordHistory('job-g', { status: 'success', durationMs: 55 });
    expect(formatLastRun('job-g')).toContain('success');
  });

  test('handles no history gracefully', () => {
    expect(formatLastRun('ghost')).toContain('No runs recorded');
  });
});
