const { withLifecycle } = require('./jobLifecycleMiddleware');
const { addHook, clearAllHooks } = require('./jobLifecycle');

beforeEach(() => clearAllHooks());

function makeContext(jobId = 'testJob') {
  return { jobId };
}

test('calls beforeRun and afterRun hooks around next()', async () => {
  const order = [];
  addHook('testJob', 'beforeRun', async () => order.push('before'));
  addHook('testJob', 'afterRun', async () => order.push('after'));
  const next = jest.fn(async () => order.push('run'));
  await withLifecycle(makeContext(), next);
  expect(order).toEqual(['before', 'run', 'after']);
});

test('calls onSuccess when next() resolves', async () => {
  const fn = jest.fn();
  addHook('testJob', 'onSuccess', fn);
  await withLifecycle(makeContext(), async () => {});
  expect(fn).toHaveBeenCalledTimes(1);
});

test('calls onFailure when next() throws', async () => {
  const fn = jest.fn();
  addHook('testJob', 'onFailure', fn);
  const err = new Error('boom');
  await expect(
    withLifecycle(makeContext(), async () => { throw err; })
  ).rejects.toThrow('boom');
  expect(fn).toHaveBeenCalledTimes(1);
});

test('does not call onSuccess when next() throws', async () => {
  const successFn = jest.fn();
  addHook('testJob', 'onSuccess', successFn);
  await expect(
    withLifecycle(makeContext(), async () => { throw new Error('fail'); })
  ).rejects.toThrow();
  expect(successFn).not.toHaveBeenCalled();
});

test('afterRun is called even when next() throws', async () => {
  const afterFn = jest.fn();
  addHook('testJob', 'afterRun', afterFn);
  await expect(
    withLifecycle(makeContext(), async () => { throw new Error('fail'); })
  ).rejects.toThrow();
  expect(afterFn).toHaveBeenCalledTimes(1);
});

test('sets context.error on failure', async () => {
  const ctx = makeContext();
  const err = new Error('oops');
  addHook('testJob', 'onFailure', async c => { expect(c.error).toBe(err); });
  await expect(withLifecycle(ctx, async () => { throw err; })).rejects.toThrow();
  expect(ctx.error).toBe(err);
});

test('works with no hooks registered', async () => {
  const next = jest.fn();
  await expect(withLifecycle(makeContext('noHooksJob'), next)).resolves.toBeUndefined();
  expect(next).toHaveBeenCalledTimes(1);
});
