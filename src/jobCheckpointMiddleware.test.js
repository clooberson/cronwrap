const { withCheckpoints } = require('./jobCheckpointMiddleware');
const { getCheckpoints, clearAllCheckpoints, hasCheckpoint } = require('./jobCheckpoint');

beforeEach(() => {
  clearAllCheckpoints();
});

describe('withCheckpoints', () => {
  test('records start and finish checkpoints on success', async () => {
    const fn = async () => 'ok';
    const wrapped = withCheckpoints('myJob', fn);
    await wrapped();

    const cps = getCheckpoints('myJob');
    expect(cps).toHaveLength(2);
    expect(cps[0].label).toBe('start');
    expect(cps[1].label).toBe('finish');
    expect(cps[1].data.success).toBe(true);
  });

  test('records error checkpoint on failure', async () => {
    const fn = async () => { throw new Error('boom'); };
    const wrapped = withCheckpoints('failJob', fn);

    await expect(wrapped()).rejects.toThrow('boom');

    expect(hasCheckpoint('failJob', 'error')).toBe(true);
    const last = getCheckpoints('failJob').find(c => c.label === 'error');
    expect(last.data.message).toBe('boom');
  });

  test('clears previous checkpoints before each run', async () => {
    const fn = async () => {};
    const wrapped = withCheckpoints('rerunJob', fn);
    await wrapped();
    await wrapped();

    // Only start + finish from the second run
    expect(getCheckpoints('rerunJob')).toHaveLength(2);
  });

  test('passes arguments through to the wrapped function', async () => {
    const fn = jest.fn(async () => {});
    const wrapped = withCheckpoints('argJob', fn);
    await wrapped('a', 'b');

    expect(fn).toHaveBeenCalledWith('a', 'b');
  });

  test('returns the result of the wrapped function', async () => {
    const fn = async () => 42;
    const wrapped = withCheckpoints('retJob', fn);
    const result = await wrapped();
    expect(result).toBe(42);
  });
});
