const { withJobEvents } = require('./jobEventsMiddleware');
const { on, clearListeners } = require('./jobEvents');

beforeEach(() => clearListeners());

test('emits beforeRun and onSuccess on successful run', async () => {
  const fired = [];
  on('testJob', 'beforeRun', () => fired.push('beforeRun'));
  on('testJob', 'onSuccess', () => fired.push('onSuccess'));
  on('testJob', 'afterRun', ({ success }) => fired.push(`afterRun:${success}`));

  const mw = withJobEvents('testJob');
  const ctx = {};
  await mw(ctx, async () => {});

  expect(fired).toEqual(['beforeRun', 'afterRun:true', 'onSuccess']);
});

test('emits onFailure and rethrows on error', async () => {
  const fired = [];
  on('failJob', 'onFailure', ({ error }) => fired.push(`fail:${error.message}`));
  on('failJob', 'afterRun', ({ success }) => fired.push(`afterRun:${success}`));

  const mw = withJobEvents('failJob');
  const ctx = {};
  const boom = new Error('boom');

  await expect(mw(ctx, async () => { throw boom; })).rejects.toThrow('boom');
  expect(fired).toContain('fail:boom');
  expect(fired).toContain('afterRun:false');
});

test('beforeRun receives context', async () => {
  let received = null;
  on('ctxJob', 'beforeRun', ({ context }) => { received = context; });

  const mw = withJobEvents('ctxJob');
  const ctx = { jobName: 'ctxJob', attempt: 1 };
  await mw(ctx, async () => {});

  expect(received).toBe(ctx);
});

test('works with no listeners registered', async () => {
  const mw = withJobEvents('silentJob');
  await expect(mw({}, async () => {})).resolves.toBeUndefined();
});

test('async handlers are awaited in order', async () => {
  const order = [];
  on('asyncJob', 'onSuccess', async () => {
    await new Promise(r => setTimeout(r, 10));
    order.push('first');
  });
  on('asyncJob', 'onSuccess', async () => { order.push('second'); });

  const mw = withJobEvents('asyncJob');
  await mw({}, async () => {});

  expect(order).toEqual(['first', 'second']);
});
