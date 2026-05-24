const { runWithDependencies } = require('./dependencyRunner');
const { addDependency, clearAllDependencies } = require('./jobDependencies');

beforeEach(() => clearAllDependencies());

describe('runWithDependencies', () => {
  test('runs independent jobs successfully', async () => {
    const fns = {
      jobA: jest.fn().mockResolvedValue('a-done'),
      jobB: jest.fn().mockResolvedValue('b-done'),
    };
    const results = await runWithDependencies(['jobA', 'jobB'], fns);
    expect(results.jobA.status).toBe('success');
    expect(results.jobA.result).toBe('a-done');
    expect(results.jobB.status).toBe('success');
  });

  test('skips job when dependency not completed', async () => {
    addDependency('jobB', 'jobA');
    const skipped = [];
    const fns = { jobB: jest.fn().mockResolvedValue('done') };
    const results = await runWithDependencies(['jobB'], fns, {
      onSkip: (name) => skipped.push(name),
    });
    expect(results.jobB.status).toBe('skipped');
    expect(skipped).toContain('jobB');
    expect(fns.jobB).not.toHaveBeenCalled();
  });

  test('runs job after dependency completes', async () => {
    addDependency('jobB', 'jobA');
    const fns = {
      jobA: jest.fn().mockResolvedValue('a'),
      jobB: jest.fn().mockResolvedValue('b'),
    };
    const results = await runWithDependencies(['jobA', 'jobB'], fns);
    expect(results.jobA.status).toBe('success');
    expect(results.jobB.status).toBe('success');
  });

  test('records error when job throws', async () => {
    const errors = [];
    const fns = { jobA: jest.fn().mockRejectedValue(new Error('boom')) };
    const results = await runWithDependencies(['jobA'], fns, {
      onError: (name, err) => errors.push({ name, err }),
    });
    expect(results.jobA.status).toBe('error');
    expect(errors[0].name).toBe('jobA');
  });

  test('errors on circular dependency', async () => {
    addDependency('jobA', 'jobB');
    addDependency('jobB', 'jobA');
    const fns = { jobA: jest.fn(), jobB: jest.fn() };
    const results = await runWithDependencies(['jobA', 'jobB'], fns);
    expect(results.jobA.status).toBe('error');
    expect(results.jobA.error.message).toMatch(/circular/i);
  });

  test('errors when no function registered', async () => {
    const results = await runWithDependencies(['ghost'], {});
    expect(results.ghost.status).toBe('error');
  });

  test('lists missing deps in skipped result', async () => {
    addDependency('jobC', 'jobA');
    addDependency('jobC', 'jobB');
    const fns = { jobC: jest.fn() };
    const results = await runWithDependencies(['jobC'], fns);
    expect(results.jobC.missing).toContain('jobA');
    expect(results.jobC.missing).toContain('jobB');
  });
});
