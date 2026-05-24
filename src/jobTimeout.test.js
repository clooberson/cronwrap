const {
  setTimeout: setJobTimeout,
  getTimeout,
  removeTimeout,
  clearAllTimeouts,
  listTimeouts,
  withTimeout,
} = require('./jobTimeout');

beforeEach(() => {
  clearAllTimeouts();
});

describe('setTimeout / getTimeout', () => {
  test('sets and retrieves a timeout', () => {
    setJobTimeout('myJob', 3000);
    expect(getTimeout('myJob')).toBe(3000);
  });

  test('returns null for unknown job', () => {
    expect(getTimeout('unknown')).toBeNull();
  });

  test('throws on invalid timeout value', () => {
    expect(() => setJobTimeout('bad', -1)).toThrow();
    expect(() => setJobTimeout('bad', 0)).toThrow();
    expect(() => setJobTimeout('bad', 'fast')).toThrow();
  });
});

describe('removeTimeout', () => {
  test('removes an existing timeout', () => {
    setJobTimeout('job1', 1000);
    removeTimeout('job1');
    expect(getTimeout('job1')).toBeNull();
  });

  test('returns false for non-existent job', () => {
    expect(removeTimeout('nope')).toBe(false);
  });
});

describe('listTimeouts', () => {
  test('lists all registered timeouts', () => {
    setJobTimeout('a', 500);
    setJobTimeout('b', 1500);
    const list = listTimeouts();
    expect(list).toHaveLength(2);
    expect(list).toContainEqual({ name: 'a', ms: 500 });
    expect(list).toContainEqual({ name: 'b', ms: 1500 });
  });
});

describe('withTimeout', () => {
  test('returns result when job finishes in time', async () => {
    setJobTimeout('fast', 500);
    const fn = () => Promise.resolve('done');
    const wrapped = withTimeout('fast', fn);
    await expect(wrapped()).resolves.toBe('done');
  });

  test('rejects when job exceeds timeout', async () => {
    setJobTimeout('slow', 50);
    const fn = () => new Promise(res => setTimeout(res, 200));
    const wrapped = withTimeout('slow', fn);
    await expect(wrapped()).rejects.toThrow('timed out after 50ms');
  });

  test('passes through args to the wrapped function', async () => {
    setJobTimeout('echo', 500);
    const fn = async (x) => x * 2;
    const wrapped = withTimeout('echo', fn);
    await expect(wrapped(7)).resolves.toBe(14);
  });

  test('returns original fn if no timeout registered', async () => {
    const fn = async () => 'untouched';
    const wrapped = withTimeout('noTimeout', fn);
    expect(wrapped).toBe(fn);
  });
});
