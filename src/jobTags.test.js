const {
  addTag,
  removeTag,
  getTags,
  getJobsByTag,
  hasTag,
  clearTags,
  clearAllTags,
} = require('./jobTags');

beforeEach(() => {
  clearAllTags();
});

describe('addTag', () => {
  it('adds a tag to a job', () => {
    addTag('backup', 'critical');
    expect(getTags('backup')).toContain('critical');
  });

  it('allows multiple tags per job', () => {
    addTag('backup', 'critical');
    addTag('backup', 'nightly');
    expect(getTags('backup')).toEqual(expect.arrayContaining(['critical', 'nightly']));
  });

  it('deduplicates tags', () => {
    addTag('backup', 'critical');
    addTag('backup', 'critical');
    expect(getTags('backup').length).toBe(1);
  });

  it('throws if jobName is missing', () => {
    expect(() => addTag(null, 'critical')).toThrow();
  });

  it('throws if tag is missing', () => {
    expect(() => addTag('backup', null)).toThrow();
  });
});

describe('removeTag', () => {
  it('removes an existing tag', () => {
    addTag('backup', 'critical');
    removeTag('backup', 'critical');
    expect(getTags('backup')).not.toContain('critical');
  });

  it('does nothing if job has no tags', () => {
    expect(() => removeTag('ghost', 'critical')).not.toThrow();
  });
});

describe('getJobsByTag', () => {
  it('returns all jobs with a given tag', () => {
    addTag('backup', 'nightly');
    addTag('cleanup', 'nightly');
    addTag('report', 'weekly');
    expect(getJobsByTag('nightly')).toEqual(expect.arrayContaining(['backup', 'cleanup']));
    expect(getJobsByTag('nightly')).not.toContain('report');
  });

  it('returns empty array if no jobs have the tag', () => {
    expect(getJobsByTag('missing')).toEqual([]);
  });
});

describe('hasTag', () => {
  it('returns true if job has the tag', () => {
    addTag('sync', 'realtime');
    expect(hasTag('sync', 'realtime')).toBe(true);
  });

  it('returns false if job does not have the tag', () => {
    expect(hasTag('sync', 'missing')).toBe(false);
  });
});

describe('clearTags', () => {
  it('removes all tags for a job', () => {
    addTag('backup', 'critical');
    addTag('backup', 'nightly');
    clearTags('backup');
    expect(getTags('backup')).toEqual([]);
  });
});
