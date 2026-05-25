const {
  saveCheckpoint,
  getCheckpoints,
  getLastCheckpoint,
  hasCheckpoint,
  clearCheckpoints,
  clearAllCheckpoints
} = require('./jobCheckpoint');

beforeEach(() => {
  clearAllCheckpoints();
});

describe('saveCheckpoint', () => {
  test('saves a checkpoint with label and data', () => {
    const cp = saveCheckpoint('job1', 'step1', { count: 5 });
    expect(cp.label).toBe('step1');
    expect(cp.data.count).toBe(5);
    expect(cp.savedAt).toBeDefined();
  });

  test('saves multiple checkpoints for the same job', () => {
    saveCheckpoint('job1', 'a');
    saveCheckpoint('job1', 'b');
    expect(getCheckpoints('job1')).toHaveLength(2);
  });
});

describe('getCheckpoints', () => {
  test('returns empty array for unknown job', () => {
    expect(getCheckpoints('unknown')).toEqual([]);
  });

  test('returns copy of checkpoints', () => {
    saveCheckpoint('job2', 'x');
    const list = getCheckpoints('job2');
    list.push({ fake: true });
    expect(getCheckpoints('job2')).toHaveLength(1);
  });
});

describe('getLastCheckpoint', () => {
  test('returns null when no checkpoints', () => {
    expect(getLastCheckpoint('empty')).toBeNull();
  });

  test('returns the most recent checkpoint', () => {
    saveCheckpoint('job3', 'first');
    saveCheckpoint('job3', 'last');
    expect(getLastCheckpoint('job3').label).toBe('last');
  });
});

describe('hasCheckpoint', () => {
  test('returns true if label exists', () => {
    saveCheckpoint('job4', 'done');
    expect(hasCheckpoint('job4', 'done')).toBe(true);
  });

  test('returns false if label does not exist', () => {
    expect(hasCheckpoint('job4', 'missing')).toBe(false);
  });
});

describe('clearCheckpoints', () => {
  test('clears checkpoints for a specific job', () => {
    saveCheckpoint('job5', 'step');
    clearCheckpoints('job5');
    expect(getCheckpoints('job5')).toHaveLength(0);
  });
});
