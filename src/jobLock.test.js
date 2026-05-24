const {
  acquireLock,
  releaseLock,
  isLocked,
  getLockState,
  getLockAge,
  forceRelease,
  clearAllLocks,
} = require('./jobLock');
const { withLock } = require('./jobLockMiddleware');

beforeEach(() => {
  clearAllLocks();
});

describe('acquireLock', () => {
  it('acquires a lock for a new job', () => {
    expect(acquireLock('job1')).toBe(true);
    expect(isLocked('job1')).toBe(true);
  });

  it('fails to acquire lock if already locked', () => {
    acquireLock('job1');
    expect(acquireLock('job1')).toBe(false);
  });

  it('stores owner on lock', () => {
    acquireLock('job1', 'runner-1');
    expect(getLockState('job1').owner).toBe('runner-1');
  });
});

describe('releaseLock', () => {
  it('releases an existing lock', () => {
    acquireLock('job1');
    expect(releaseLock('job1')).toBe(true);
    expect(isLocked('job1')).toBe(false);
  });

  it('returns false if lock not held', () => {
    expect(releaseLock('job1')).toBe(false);
  });
});

describe('getLockState', () => {
  it('returns default state for unknown job', () => {
    const state = getLockState('unknown');
    expect(state.locked).toBe(false);
    expect(state.owner).toBeNull();
  });

  it('returns correct state after acquiring', () => {
    acquireLock('job2', 'me');
    const state = getLockState('job2');
    expect(state.locked).toBe(true);
    expect(state.owner).toBe('me');
    expect(state.acquiredAt).toBeGreaterThan(0);
  });
});

describe('getLockAge', () => {
  it('returns null if not locked', () => {
    expect(getLockAge('job1')).toBeNull();
  });

  it('returns a non-negative number when locked', () => {
    acquireLock('job1');
    const age = getLockAge('job1');
    expect(age).toBeGreaterThanOrEqual(0);
  });
});

describe('forceRelease', () => {
  it('removes lock entirely', () => {
    acquireLock('job1');
    forceRelease('job1');
    expect(isLocked('job1')).toBe(false);
  });
});

describe('withLock middleware', () => {
  it('runs job when not locked', async () => {
    const fn = jest.fn().mockResolvedValue('done');
    const wrapped = withLock('job3', fn);
    const result = await wrapped();
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('skips job if already locked', async () => {
    acquireLock('job4');
    const fn = jest.fn().mockResolvedValue('done');
    const wrapped = withLock('job4', fn);
    const result = await wrapped();
    expect(result.skipped).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });

  it('releases lock after job completes', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const wrapped = withLock('job5', fn);
    await wrapped();
    expect(isLocked('job5')).toBe(false);
  });

  it('releases lock even if job throws', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('boom'));
    const wrapped = withLock('job6', fn);
    await expect(wrapped()).rejects.toThrow('boom');
    expect(isLocked('job6')).toBe(false);
  });

  it('calls onSkip callback when skipped', async () => {
    acquireLock('job7');
    const onSkip = jest.fn();
    const wrapped = withLock('job7', jest.fn(), { onSkip });
    await wrapped();
    expect(onSkip).toHaveBeenCalledWith('job7');
  });
});
