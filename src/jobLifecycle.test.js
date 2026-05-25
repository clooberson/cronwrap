const {
  addHook,
  removeHook,
  runHooks,
  getHooks,
  clearHooks,
  clearAllHooks,
  VALID_HOOKS,
} = require('./jobLifecycle');

beforeEach(() => clearAllHooks());

test('VALID_HOOKS contains expected hook names', () => {
  expect(VALID_HOOKS).toEqual(expect.arrayContaining(['beforeRun', 'afterRun', 'onSuccess', 'onFailure', 'onSkip']));
});

test('addHook registers a hook function', () => {
  const fn = jest.fn();
  addHook('job1', 'beforeRun', fn);
  expect(getHooks('job1', 'beforeRun')).toContain(fn);
});

test('addHook throws on invalid hook name', () => {
  expect(() => addHook('job1', 'onMagic', jest.fn())).toThrow('Unknown lifecycle hook');
});

test('addHook throws if fn is not a function', () => {
  expect(() => addHook('job1', 'beforeRun', 'notAFn')).toThrow('Hook must be a function');
});

test('removeHook removes a specific hook', () => {
  const fn = jest.fn();
  addHook('job1', 'afterRun', fn);
  removeHook('job1', 'afterRun', fn);
  expect(getHooks('job1', 'afterRun')).not.toContain(fn);
});

test('runHooks calls all registered hooks in order', async () => {
  const calls = [];
  addHook('job1', 'onSuccess', async ctx => calls.push('a'));
  addHook('job1', 'onSuccess', async ctx => calls.push('b'));
  await runHooks('job1', 'onSuccess', { jobId: 'job1' });
  expect(calls).toEqual(['a', 'b']);
});

test('runHooks passes context to hooks', async () => {
  const received = [];
  addHook('job2', 'beforeRun', async ctx => received.push(ctx));
  const ctx = { jobId: 'job2', extra: 42 };
  await runHooks('job2', 'beforeRun', ctx);
  expect(received[0]).toMatchObject({ jobId: 'job2', extra: 42 });
});

test('getHooks returns all hooks when no hookName given', () => {
  const fn = jest.fn();
  addHook('job3', 'onFailure', fn);
  const all = getHooks('job3');
  expect(all.onFailure).toContain(fn);
  expect(all.beforeRun).toEqual([]);
});

test('clearHooks removes all hooks for a job', () => {
  addHook('job4', 'beforeRun', jest.fn());
  clearHooks('job4');
  expect(getHooks('job4', 'beforeRun')).toEqual([]);
});

test('multiple jobs have independent hooks', () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  addHook('jobA', 'beforeRun', fn1);
  addHook('jobB', 'beforeRun', fn2);
  expect(getHooks('jobA', 'beforeRun')).toEqual([fn1]);
  expect(getHooks('jobB', 'beforeRun')).toEqual([fn2]);
});
