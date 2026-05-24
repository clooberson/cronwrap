const {
  addDependency,
  removeDependency,
  getDependencies,
  hasDependency,
  clearDependencies,
  clearAllDependencies,
  areDependenciesMet,
  hasCircularDependency,
} = require('./jobDependencies');

beforeEach(() => clearAllDependencies());

describe('addDependency / getDependencies', () => {
  test('adds and retrieves a dependency', () => {
    addDependency('jobB', 'jobA');
    expect(getDependencies('jobB')).toEqual(['jobA']);
  });

  test('supports multiple dependencies', () => {
    addDependency('jobC', 'jobA');
    addDependency('jobC', 'jobB');
    expect(getDependencies('jobC')).toContain('jobA');
    expect(getDependencies('jobC')).toContain('jobB');
  });

  test('throws if job depends on itself', () => {
    expect(() => addDependency('jobA', 'jobA')).toThrow();
  });

  test('returns empty array for unknown job', () => {
    expect(getDependencies('unknown')).toEqual([]);
  });
});

describe('hasDependency', () => {
  test('returns true when dependency exists', () => {
    addDependency('jobB', 'jobA');
    expect(hasDependency('jobB', 'jobA')).toBe(true);
  });

  test('returns false when dependency does not exist', () => {
    expect(hasDependency('jobB', 'jobA')).toBe(false);
  });
});

describe('removeDependency', () => {
  test('removes an existing dependency', () => {
    addDependency('jobB', 'jobA');
    removeDependency('jobB', 'jobA');
    expect(getDependencies('jobB')).toEqual([]);
  });
});

describe('areDependenciesMet', () => {
  test('returns true when all deps are completed', () => {
    addDependency('jobC', 'jobA');
    addDependency('jobC', 'jobB');
    expect(areDependenciesMet('jobC', new Set(['jobA', 'jobB']))).toBe(true);
  });

  test('returns false when a dep is missing', () => {
    addDependency('jobC', 'jobA');
    expect(areDependenciesMet('jobC', new Set())).toBe(false);
  });

  test('returns true for job with no dependencies', () => {
    expect(areDependenciesMet('standalone', new Set())).toBe(true);
  });
});

describe('hasCircularDependency', () => {
  test('detects a simple cycle', () => {
    addDependency('jobA', 'jobB');
    addDependency('jobB', 'jobA');
    expect(hasCircularDependency('jobA')).toBe(true);
  });

  test('returns false for acyclic graph', () => {
    addDependency('jobB', 'jobA');
    addDependency('jobC', 'jobB');
    expect(hasCircularDependency('jobC')).toBe(false);
  });
});
