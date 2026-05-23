const {
  formatEntry,
  formatHistoryReport,
  formatLastRun,
  printHistoryReport
} = require('./historyReporter');
const { recordHistory, clearHistory, getHistory } = require('./history');

beforeEach(() => {
  clearHistory('testJob');
  clearHistory('otherJob');
});

describe('formatEntry', () => {
  it('formats a successful entry', () => {
    const entry = {
      timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
      success: true,
      durationMs: 1234,
      error: null
    };
    const result = formatEntry(entry);
    expect(result).toContain('✓');
    expect(result).toContain('1234ms');
    expect(result).toContain('2024-01-15');
  });

  it('formats a failed entry with error', () => {
    const entry = {
      timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
      success: false,
      durationMs: 500,
      error: 'Something went wrong'
    };
    const result = formatEntry(entry);
    expect(result).toContain('✗');
    expect(result).toContain('Something went wrong');
  });
});

describe('formatHistoryReport', () => {
  it('returns message when no history', () => {
    const result = formatHistoryReport('emptyJob', []);
    expect(result).toContain('No history');
    expect(result).toContain('emptyJob');
  });

  it('formats multiple entries', () => {
    recordHistory('testJob', true, 100, null);
    recordHistory('testJob', false, 200, 'oops');
    const history = getHistory('testJob');
    const result = formatHistoryReport('testJob', history);
    expect(result).toContain('testJob');
    expect(result).toContain('✓');
    expect(result).toContain('✗');
  });
});

describe('formatLastRun', () => {
  it('returns message when no history', () => {
    const result = formatLastRun('emptyJob', null);
    expect(result).toContain('No runs recorded');
  });

  it('formats last run entry', () => {
    recordHistory('testJob', true, 300, null);
    const history = getHistory('testJob');
    const last = history[history.length - 1];
    const result = formatLastRun('testJob', last);
    expect(result).toContain('Last run');
    expect(result).toContain('testJob');
    expect(result).toContain('300ms');
  });
});

describe('printHistoryReport', () => {
  it('calls console.log without throwing', () => {
    recordHistory('testJob', true, 150, null);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => printHistoryReport('testJob')).not.toThrow();
    spy.mockRestore();
  });
});
