const {
  setQuota, removeQuota, checkQuota, recordQuotaRun,
  getQuotaState, resetAllQuotas
} = require('./jobQuota');

beforeEach(() => resetAllQuotas());

test('allows runs when quota not set', () => {
  const r = checkQuota('job-a');
  expect(r.allowed).toBe(true);
  expect(r.remaining).toBeNull();
});

test('allows runs within quota', () => {
  setQuota('job-b', 3, 60000);
  recordQuotaRun('job-b');
  recordQuotaRun('job-b');
  const r = checkQuota('job-b');
  expect(r.allowed).toBe(true);
  expect(r.remaining).toBe(1);
});

test('blocks runs when quota exceeded', () => {
  setQuota('job-c', 2, 60000);
  recordQuotaRun('job-c');
  recordQuotaRun('job-c');
  const r = checkQuota('job-c');
  expect(r.allowed).toBe(false);
  expect(r.remaining).toBe(0);
});

test('quota resets after window expires', async () => {
  setQuota('job-d', 1, 50);
  recordQuotaRun('job-d');
  expect(checkQuota('job-d').allowed).toBe(false);
  await new Promise(r => setTimeout(r, 60));
  expect(checkQuota('job-d').allowed).toBe(true);
});

test('setQuota throws on invalid limit', () => {
  expect(() => setQuota('job-e', 0, 1000)).toThrow();
  expect(() => setQuota('job-e', -1, 1000)).toThrow();
});

test('setQuota throws on invalid windowMs', () => {
  expect(() => setQuota('job-f', 5, 0)).toThrow();
});

test('removeQuota clears quota', () => {
  setQuota('job-g', 1, 60000);
  recordQuotaRun('job-g');
  removeQuota('job-g');
  expect(checkQuota('job-g').allowed).toBe(true);
});

test('getQuotaState returns null when not set', () => {
  expect(getQuotaState('job-x')).toBeNull();
});

test('getQuotaState returns current state', () => {
  setQuota('job-h', 5, 60000);
  recordQuotaRun('job-h');
  const state = getQuotaState('job-h');
  expect(state.limit).toBe(5);
  expect(state.usedInWindow).toBe(1);
  expect(state.remaining).toBe(4);
});
