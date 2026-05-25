const { withQuota } = require('./jobQuotaMiddleware');
const { setQuota, recordQuotaRun, resetAllQuotas } = require('./jobQuota');

beforeEach(() => resetAllQuotas());

function makeContext() {
  const logs = [];
  return { log: (msg) => logs.push(msg), logs };
}

test('runs job when quota is available', async () => {
  setQuota('mw-job-1', 3, 60000);
  let ran = false;
  const wrapped = withQuota('mw-job-1')(async () => { ran = true; });
  const ctx = makeContext();
  await wrapped(ctx);
  expect(ran).toBe(true);
  expect(ctx.skippedByQuota).toBeUndefined();
});

test('skips job when quota exceeded', async () => {
  setQuota('mw-job-2', 1, 60000);
  recordQuotaRun('mw-job-2');
  let ran = false;
  const wrapped = withQuota('mw-job-2')(async () => { ran = true; });
  const ctx = makeContext();
  await wrapped(ctx);
  expect(ran).toBe(false);
  expect(ctx.skippedByQuota).toBe(true);
});

test('sets quotaRemaining on context after run', async () => {
  setQuota('mw-job-3', 5, 60000);
  const wrapped = withQuota('mw-job-3')(async () => {});
  const ctx = makeContext();
  await wrapped(ctx);
  expect(ctx.quotaRemaining).toBe(4);
});

test('logs warning when quota exceeded', async () => {
  setQuota('mw-job-4', 1, 60000);
  recordQuotaRun('mw-job-4');
  const wrapped = withQuota('mw-job-4')(async () => {});
  const ctx = makeContext();
  await wrapped(ctx);
  expect(ctx.logs.some(l => l.includes('quota exceeded'))).toBe(true);
});

test('runs without context object', async () => {
  setQuota('mw-job-5', 2, 60000);
  let ran = false;
  const wrapped = withQuota('mw-job-5')(async () => { ran = true; });
  await wrapped(null);
  expect(ran).toBe(true);
});

test('passes context to inner function', async () => {
  setQuota('mw-job-6', 2, 60000);
  let received = null;
  const wrapped = withQuota('mw-job-6')(async (ctx) => { received = ctx; });
  const ctx = makeContext();
  await wrapped(ctx);
  expect(received).toBe(ctx);
});
