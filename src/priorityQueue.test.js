const {
  enqueue,
  dequeue,
  peek,
  queueSize,
  clearQueue,
  clearAllQueues,
  listQueue
} = require('./priorityQueue');
const { setPriority, PRIORITY_LEVELS, clearPriorities } = require('./jobPriority');

beforeEach(() => {
  clearAllQueues();
  clearPriorities();
});

const noop = () => {};

describe('enqueue / dequeue', () => {
  test('dequeues in priority order', () => {
    setPriority('low-job', PRIORITY_LEVELS.LOW);
    setPriority('critical-job', PRIORITY_LEVELS.CRITICAL);
    enqueue('main', 'low-job', noop);
    enqueue('main', 'critical-job', noop);
    const first = dequeue('main');
    expect(first.jobName).toBe('critical-job');
  });

  test('returns null when queue is empty', () => {
    expect(dequeue('empty')).toBeNull();
  });

  test('FIFO for equal priority', () => {
    enqueue('main', 'jobA', noop);
    enqueue('main', 'jobB', noop);
    expect(dequeue('main').jobName).toBe('jobA');
  });
});

describe('peek', () => {
  test('returns first item without removing it', () => {
    enqueue('q', 'jobX', noop);
    expect(peek('q').jobName).toBe('jobX');
    expect(queueSize('q')).toBe(1);
  });

  test('returns null on empty queue', () => {
    expect(peek('empty')).toBeNull();
  });
});

describe('queueSize', () => {
  test('tracks size correctly', () => {
    enqueue('q', 'a', noop);
    enqueue('q', 'b', noop);
    expect(queueSize('q')).toBe(2);
    dequeue('q');
    expect(queueSize('q')).toBe(1);
  });
});

describe('listQueue', () => {
  test('returns snapshot of queue', () => {
    enqueue('q', 'j1', noop);
    enqueue('q', 'j2', noop);
    const list = listQueue('q');
    expect(list).toHaveLength(2);
    expect(list[0].jobName).toBeDefined();
  });
});

describe('clearQueue', () => {
  test('empties a named queue', () => {
    enqueue('q', 'job', noop);
    clearQueue('q');
    expect(queueSize('q')).toBe(0);
  });
});
