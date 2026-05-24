const { on, off, emit, listListeners, clearListeners, VALID_EVENTS } = require('./jobEvents');

beforeEach(() => clearListeners());

test('registers and emits a handler', async () => {
  const calls = [];
  on('myJob', 'onSuccess', (payload) => calls.push(payload));
  await emit('myJob', 'onSuccess', { result: 42 });
  expect(calls).toHaveLength(1);
  expect(calls[0].jobName).toBe('myJob');
  expect(calls[0].event).toBe('onSuccess');
  expect(calls[0].result).toBe(42);
});

test('supports multiple handlers for same event', async () => {
  const calls = [];
  on('job1', 'beforeRun', () => calls.push('a'));
  on('job1', 'beforeRun', () => calls.push('b'));
  await emit('job1', 'beforeRun');
  expect(calls).toEqual(['a', 'b']);
});

test('off removes a specific handler', async () => {
  const calls = [];
  const handler = () => calls.push('x');
  on('job2', 'afterRun', handler);
  off('job2', 'afterRun', handler);
  await emit('job2', 'afterRun');
  expect(calls).toHaveLength(0);
});

test('throws on unknown event', () => {
  expect(() => on('job3', 'badEvent', () => {})).toThrow('Unknown event');
});

test('throws if handler is not a function', () => {
  expect(() => on('job3', 'onFailure', 'notAFunction')).toThrow('Handler must be a function');
});

test('listListeners returns counts per event', () => {
  on('job4', 'onRetry', () => {});
  on('job4', 'onRetry', () => {});
  on('job4', 'onSkip', () => {});
  const info = listListeners('job4');
  expect(info.onRetry).toBe(2);
  expect(info.onSkip).toBe(1);
});

test('clearListeners clears a specific job', async () => {
  on('job5', 'onSuccess', () => {});
  clearListeners('job5');
  expect(listListeners('job5')).toEqual({});
});

test('clearListeners with no arg clears all', () => {
  on('jobA', 'beforeRun', () => {});
  on('jobB', 'afterRun', () => {});
  clearListeners();
  expect(listListeners('jobA')).toEqual({});
  expect(listListeners('jobB')).toEqual({});
});

test('VALID_EVENTS contains expected entries', () => {
  expect(VALID_EVENTS).toContain('beforeRun');
  expect(VALID_EVENTS).toContain('onFailure');
});
