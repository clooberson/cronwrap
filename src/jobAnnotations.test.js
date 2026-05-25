const {
  annotate,
  getAnnotation,
  getAnnotations,
  removeAnnotation,
  clearAnnotations,
  getJobsByAnnotation,
  resetAllAnnotations,
} = require('./jobAnnotations');
const { withAnnotations } = require('./jobAnnotationsMiddleware');

beforeEach(() => resetAllAnnotations());

describe('annotate / getAnnotation', () => {
  test('stores and retrieves a value', () => {
    annotate('job1', 'owner', 'alice');
    expect(getAnnotation('job1', 'owner')).toBe('alice');
  });

  test('returns undefined for missing key', () => {
    expect(getAnnotation('job1', 'missing')).toBeUndefined();
  });

  test('throws if jobId missing', () => {
    expect(() => annotate('', 'key', 'v')).toThrow();
  });

  test('throws if key missing', () => {
    expect(() => annotate('job1', '', 'v')).toThrow();
  });
});

describe('getAnnotations', () => {
  test('returns a copy of all annotations', () => {
    annotate('job2', 'env', 'prod');
    annotate('job2', 'team', 'backend');
    const all = getAnnotations('job2');
    expect(all).toEqual({ env: 'prod', team: 'backend' });
  });

  test('mutations to returned object do not affect store', () => {
    annotate('job3', 'x', 1);
    const snap = getAnnotations('job3');
    snap.x = 99;
    expect(getAnnotation('job3', 'x')).toBe(1);
  });
});

describe('removeAnnotation / clearAnnotations', () => {
  test('removes a single key', () => {
    annotate('job4', 'a', 1);
    annotate('job4', 'b', 2);
    removeAnnotation('job4', 'a');
    expect(getAnnotation('job4', 'a')).toBeUndefined();
    expect(getAnnotation('job4', 'b')).toBe(2);
  });

  test('clearAnnotations wipes all keys', () => {
    annotate('job5', 'a', 1);
    clearAnnotations('job5');
    expect(getAnnotations('job5')).toEqual({});
  });
});

describe('getJobsByAnnotation', () => {
  test('finds jobs that have a key', () => {
    annotate('jobA', 'critical', true);
    annotate('jobB', 'critical', false);
    annotate('jobC', 'other', 'x');
    expect(getJobsByAnnotation('critical')).toEqual(expect.arrayContaining(['jobA', 'jobB']));
    expect(getJobsByAnnotation('critical')).not.toContain('jobC');
  });

  test('finds jobs by key+value', () => {
    annotate('j1', 'region', 'us-east');
    annotate('j2', 'region', 'eu-west');
    expect(getJobsByAnnotation('region', 'us-east')).toEqual(['j1']);
  });
});

describe('withAnnotations middleware', () => {
  test('injects annotations into context', async () => {
    annotate('mw1', 'foo', 'bar');
    const ctx = {};
    const mw = withAnnotations('mw1');
    await mw(ctx, async () => {});
    expect(ctx.annotations).toEqual({ foo: 'bar' });
  });

  test('refreshes annotations after next()', async () => {
    annotate('mw2', 'count', 0);
    const ctx = {};
    const mw = withAnnotations('mw2');
    await mw(ctx, async () => {
      annotate('mw2', 'count', 42);
    });
    expect(ctx.annotations.count).toBe(42);
  });
});
