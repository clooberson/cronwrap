const {
  PRIORITY_LEVELS,
  setPriority,
  getPriority,
  removePriority,
  getJobsByPriority,
  sortJobsByPriority,
  listPriorities,
  clearPriorities
} = require('./jobPriority');

beforeEach(() => clearPriorities());

describe('PRIORITY_LEVELS', () => {
  test('has expected levels', () => {
    expect(PRIORITY_LEVELS.CRITICAL).toBe(1);
    expect(PRIORITY_LEVELS.HIGH).toBe(2);
    expect(PRIORITY_LEVELS.NORMAL).toBe(3);
    expect(PRIORITY_LEVELS.LOW).toBe(4);
    expect(PRIORITY_LEVELS.BACKGROUND).toBe(5);
  });
});

describe('setPriority / getPriority', () => {
  test('sets and gets a priority', () => {
    setPriority('billing', PRIORITY_LEVELS.HIGH);
    expect(getPriority('billing')).toBe(PRIORITY_LEVELS.HIGH);
  });

  test('defaults to NORMAL if not set', () => {
    expect(getPriority('unknown-job')).toBe(PRIORITY_LEVELS.NORMAL);
  });

  test('throws on invalid level', () => {
    expect(() => setPriority('job', 99)).toThrow('Invalid priority level');
  });
});

describe('removePriority', () => {
  test('removes a priority entry', () => {
    setPriority('cleanup', PRIORITY_LEVELS.LOW);
    removePriority('cleanup');
    expect(getPriority('cleanup')).toBe(PRIORITY_LEVELS.NORMAL);
  });
});

describe('getJobsByPriority', () => {
  test('returns jobs at a given level', () => {
    setPriority('jobA', PRIORITY_LEVELS.HIGH);
    setPriority('jobB', PRIORITY_LEVELS.HIGH);
    setPriority('jobC', PRIORITY_LEVELS.LOW);
    expect(getJobsByPriority(PRIORITY_LEVELS.HIGH)).toEqual(expect.arrayContaining(['jobA', 'jobB']));
    expect(getJobsByPriority(PRIORITY_LEVELS.HIGH)).toHaveLength(2);
  });
});

describe('sortJobsByPriority', () => {
  test('sorts jobs by ascending priority number', () => {
    setPriority('low', PRIORITY_LEVELS.LOW);
    setPriority('critical', PRIORITY_LEVELS.CRITICAL);
    setPriority('normal', PRIORITY_LEVELS.NORMAL);
    const sorted = sortJobsByPriority(['low', 'normal', 'critical']);
    expect(sorted).toEqual(['critical', 'normal', 'low']);
  });
});

describe('listPriorities', () => {
  test('returns all set priorities', () => {
    setPriority('a', PRIORITY_LEVELS.HIGH);
    setPriority('b', PRIORITY_LEVELS.BACKGROUND);
    const list = listPriorities();
    expect(list).toMatchObject({ a: PRIORITY_LEVELS.HIGH, b: PRIORITY_LEVELS.BACKGROUND });
  });
});
