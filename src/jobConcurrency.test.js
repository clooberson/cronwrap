const {
  getOrInitConcurrency,
  setConcurrencyLimit,
  getConcurrencyState,
  canRun,
  acquireSlot,
  releaseSlot,
  incrementQueued,
  decrementQueued,
  resetConcurrency,
  resetAllConcurrency,
} = require('./jobConcurrency');

beforeEach(() => resetAllConcurrency());

test('getOrInitConcurrency returns default state', () => {
  const state = getOrInitConcurrency('job1');
  expect(state.limit).toBe(1);
  expect(state.running).toBe(0);
  expect(state.queued).toBe(0);
});

test('setConcurrencyLimit updates the limit', () => {
  setConcurrencyLimit('job1', 3);
  expect(getConcurrencyState('job1').limit).toBe(3);
});

test('setConcurrencyLimit throws for invalid limit', () => {
  expect(() => setConcurrencyLimit('job1', 0)).toThrow();
  expect(() => setConcurrencyLimit('job1', -1)).toThrow();
  expect(() => setConcurrencyLimit('job1', 'x')).toThrow();
});

test('canRun returns true when under limit', () => {
  setConcurrencyLimit('job1', 2);
  acquireSlot('job1');
  expect(canRun('job1')).toBe(true);
});

test('canRun returns false when at limit', () => {
  setConcurrencyLimit('job1', 1);
  acquireSlot('job1');
  expect(canRun('job1')).toBe(false);
});

test('acquireSlot increments running count', () => {
  acquireSlot('job1');
  expect(getConcurrencyState('job1').running).toBe(1);
});

test('acquireSlot returns false when at limit', () => {
  setConcurrencyLimit('job1', 1);
  acquireSlot('job1');
  expect(acquireSlot('job1')).toBe(false);
});

test('releaseSlot decrements running count', () => {
  acquireSlot('job1');
  releaseSlot('job1');
  expect(getConcurrencyState('job1').running).toBe(0);
});

test('releaseSlot does not go below 0', () => {
  releaseSlot('job1');
  expect(getConcurrencyState('job1').running).toBe(0);
});

test('incrementQueued and decrementQueued track queued count', () => {
  incrementQueued('job1');
  incrementQueued('job1');
  expect(getConcurrencyState('job1').queued).toBe(2);
  decrementQueued('job1');
  expect(getConcurrencyState('job1').queued).toBe(1);
});

test('resetConcurrency removes job state', () => {
  acquireSlot('job1');
  resetConcurrency('job1');
  expect(getConcurrencyState('job1').running).toBe(0);
});
