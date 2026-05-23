const {
  registerChannel,
  getChannel,
  listChannels,
  notify,
  notifyAll,
  clearChannels,
} = require('./notifications');

beforeEach(() => clearChannels());

describe('registerChannel / getChannel', () => {
  test('registers and retrieves a channel', () => {
    const handler = jest.fn();
    registerChannel('slack', handler);
    expect(getChannel('slack')).toBe(handler);
  });

  test('throws if handler is not a function', () => {
    expect(() => registerChannel('bad', 'not-a-fn')).toThrow();
  });

  test('returns null for unknown channel', () => {
    expect(getChannel('unknown')).toBeNull();
  });
});

describe('listChannels', () => {
  test('returns empty array when no channels', () => {
    expect(listChannels()).toEqual([]);
  });

  test('lists registered channels', () => {
    registerChannel('a', jest.fn());
    registerChannel('b', jest.fn());
    expect(listChannels()).toEqual(expect.arrayContaining(['a', 'b']));
  });
});

describe('notify', () => {
  test('calls the correct channel handler', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    registerChannel('email', handler);
    const event = { jobName: 'test', status: 'success', message: 'ok' };
    await notify('email', event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  test('throws for unknown channel', async () => {
    await expect(notify('ghost', {})).rejects.toThrow('No channel registered');
  });
});

describe('notifyAll', () => {
  test('calls all channels and returns results', async () => {
    const h1 = jest.fn().mockResolvedValue(undefined);
    const h2 = jest.fn().mockResolvedValue(undefined);
    registerChannel('c1', h1);
    registerChannel('c2', h2);
    const results = await notifyAll({ jobName: 'x', status: 'success' });
    expect(results).toHaveLength(2);
    expect(results.every(r => r.ok)).toBe(true);
  });

  test('captures errors without throwing', async () => {
    registerChannel('bad', jest.fn().mockRejectedValue(new Error('boom')));
    const results = await notifyAll({ jobName: 'x', status: 'failure' });
    expect(results[0].ok).toBe(false);
    expect(results[0].error).toBe('boom');
  });
});
