const {
  setThrottle,
  shouldThrottle,
  recordThrottledRun,
  recordSkip,
  getThrottleState,
  removeThrottle,
  clearAllThrottles,
  listThrottles,
} = require('./jobThrottle');

beforeEach(() => {
  clearAllThrottles();
});

test('setThrottle registers a throttle for a job', () => {
  setThrottle('myJob', 5000);
  const state = getThrottleState('myJob');
  expect(state).not.toBeNull();
  expect(state.intervalMs).toBe(5000);
  expect(state.lastRunAt).toBeNull();
});

test('setThrottle throws on invalid intervalMs', () => {
  expect(() => setThrottle('myJob', -100)).toThrow();
  expect(() => setThrottle('myJob', 0)).toThrow();
  expect(() => setThrottle('myJob', 'fast')).toThrow();
});

test('shouldThrottle returns false when no lastRunAt', () => {
  setThrottle('myJob', 5000);
  expect(shouldThrottle('myJob')).toBe(false);
});

test('shouldThrottle returns false for unknown job', () => {
  expect(shouldThrottle('unknownJob')).toBe(false);
});

test('shouldThrottle returns true when within interval', () => {
  setThrottle('myJob', 60000);
  recordThrottledRun('myJob');
  expect(shouldThrottle('myJob')).toBe(true);
});

test('shouldThrottle returns false when interval has passed', () => {
  setThrottle('myJob', 1);
  recordThrottledRun('myJob');
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(shouldThrottle('myJob')).toBe(false);
      resolve();
    }, 10);
  });
});

test('recordSkip increments skippedCount', () => {
  setThrottle('myJob', 5000);
  recordSkip('myJob');
  recordSkip('myJob');
  const state = getThrottleState('myJob');
  expect(state.skippedCount).toBe(2);
});

test('recordThrottledRun resets skippedCount', () => {
  setThrottle('myJob', 5000);
  recordSkip('myJob');
  recordThrottledRun('myJob');
  expect(getThrottleState('myJob').skippedCount).toBe(0);
});

test('removeThrottle deletes a job throttle', () => {
  setThrottle('myJob', 5000);
  removeThrottle('myJob');
  expect(getThrottleState('myJob')).toBeNull();
});

test('listThrottles returns all registered job names', () => {
  setThrottle('jobA', 1000);
  setThrottle('jobB', 2000);
  expect(listThrottles()).toEqual(expect.arrayContaining(['jobA', 'jobB']));
});
