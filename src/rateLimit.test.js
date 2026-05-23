const {
  checkRateLimit,
  getRateLimitState,
  resetRateLimit,
  resetAllRateLimits
} = require('./rateLimit');

beforeEach(() => {
  resetAllRateLimits();
});

describe('checkRateLimit', () => {
  it('allows runs under the limit', () => {
    const result = checkRateLimit('job1', { maxRuns: 3, windowMs: 60000 });
    expect(result.allowed).toBe(true);
  });

  it('allows exactly maxRuns executions', () => {
    for (let i = 0; i < 3; i++) {
      const r = checkRateLimit('job2', { maxRuns: 3, windowMs: 60000 });
      expect(r.allowed).toBe(true);
    }
  });

  it('blocks the run after maxRuns is exceeded', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('job3', { maxRuns: 3, windowMs: 60000 });
    }
    const result = checkRateLimit('job3', { maxRuns: 3, windowMs: 60000 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Rate limit exceeded/);
  });

  it('increments violation count on blocked runs', () => {
    for (let i = 0; i < 4; i++) {
      checkRateLimit('job4', { maxRuns: 2, windowMs: 60000 });
    }
    const state = getRateLimitState('job4');
    expect(state.violations).toBe(2);
  });

  it('resets count after window expires', () => {
    checkRateLimit('job5', { maxRuns: 1, windowMs: 1 });
    return new Promise(resolve => setTimeout(() => {
      const result = checkRateLimit('job5', { maxRuns: 1, windowMs: 1 });
      expect(result.allowed).toBe(true);
      resolve();
    }, 10));
  });
});

describe('getRateLimitState', () => {
  it('returns null for unknown job', () => {
    expect(getRateLimitState('unknown')).toBeNull();
  });

  it('returns state after a check', () => {
    checkRateLimit('job6', { maxRuns: 5, windowMs: 60000 });
    const state = getRateLimitState('job6');
    expect(state).not.toBeNull();
    expect(state.count).toBe(1);
  });
});

describe('resetRateLimit', () => {
  it('clears state for a specific job', () => {
    checkRateLimit('job7', { maxRuns: 5, windowMs: 60000 });
    resetRateLimit('job7');
    expect(getRateLimitState('job7')).toBeNull();
  });
});
