const {
  definePolicy,
  getPolicy,
  assignPolicy,
  getJobPolicy,
  removePolicy,
  listPolicies,
  computeBackoff,
  clearAll,
  DEFAULT_POLICY,
} = require('./jobRetryPolicy');

beforeEach(() => clearAll());

test('definePolicy stores a policy with defaults merged', () => {
  const p = definePolicy('fast', { maxAttempts: 5, backoffMs: 200 });
  expect(p.name).toBe('fast');
  expect(p.maxAttempts).toBe(5);
  expect(p.backoffMs).toBe(200);
  expect(p.backoffMultiplier).toBe(DEFAULT_POLICY.backoffMultiplier);
});

test('getPolicy returns null for unknown policy', () => {
  expect(getPolicy('nope')).toBeNull();
});

test('assignPolicy and getJobPolicy work together', () => {
  definePolicy('slow', { maxAttempts: 10, backoffMs: 5000 });
  assignPolicy('job-1', 'slow');
  const p = getJobPolicy('job-1');
  expect(p.name).toBe('slow');
  expect(p.maxAttempts).toBe(10);
});

test('getJobPolicy returns default policy for unassigned job', () => {
  const p = getJobPolicy('unknown-job');
  expect(p.name).toBe('default');
  expect(p.maxAttempts).toBe(DEFAULT_POLICY.maxAttempts);
});

test('assignPolicy throws if policy does not exist', () => {
  expect(() => assignPolicy('job-2', 'ghost')).toThrow("Policy 'ghost' is not defined");
});

test('removePolicy deletes policy and unassigns jobs', () => {
  definePolicy('temp', { maxAttempts: 2 });
  assignPolicy('job-3', 'temp');
  removePolicy('temp');
  expect(getPolicy('temp')).toBeNull();
  const p = getJobPolicy('job-3');
  expect(p.name).toBe('default');
});

test('listPolicies returns all defined policies', () => {
  definePolicy('a', {});
  definePolicy('b', {});
  const list = listPolicies();
  expect(list).toHaveLength(2);
  expect(list.map(p => p.name)).toContain('a');
});

test('computeBackoff applies exponential backoff', () => {
  const policy = { backoffMs: 1000, backoffMultiplier: 2, maxBackoffMs: 30000 };
  expect(computeBackoff(policy, 1)).toBe(1000);
  expect(computeBackoff(policy, 2)).toBe(2000);
  expect(computeBackoff(policy, 3)).toBe(4000);
});

test('computeBackoff caps at maxBackoffMs', () => {
  const policy = { backoffMs: 10000, backoffMultiplier: 10, maxBackoffMs: 30000 };
  expect(computeBackoff(policy, 4)).toBe(30000);
});

test('definePolicy throws on invalid name', () => {
  expect(() => definePolicy('')).toThrow();
  expect(() => definePolicy(null)).toThrow();
});
