# Job Dependencies

Declare dependencies between jobs so that a job only runs after its prerequisites have completed successfully.

## Setup

```js
const { addDependency } = require('./jobDependencies');
const { runWithDependencies } = require('./dependencyRunner');

// jobB will only run after jobA has completed
addDependency('jobB', 'jobA');
```

## Running Jobs in Order

```js
const jobFns = {
  jobA: async () => { /* fetch data */ },
  jobB: async () => { /* process data */ },
};

const results = await runWithDependencies(['jobA', 'jobB'], jobFns, {
  onSkip: (name, missing) => console.warn(`${name} skipped, waiting on: ${missing.join(', ')}`),
  onError: (name, err) => console.error(`${name} failed:`, err.message),
});

console.log(results);
// { jobA: { status: 'success', result: ... }, jobB: { status: 'success', result: ... } }
```

## API

### `addDependency(jobName, dependsOn)`
Registers that `jobName` depends on `dependsOn`.

### `removeDependency(jobName, dependsOn)`
Removes a specific dependency.

### `getDependencies(jobName) → string[]`
Returns all declared dependencies for a job.

### `hasDependency(jobName, dependsOn) → boolean`
Checks if a specific dependency exists.

### `areDependenciesMet(jobName, completedJobs) → boolean`
Returns `true` if all dependencies appear in the `completedJobs` Set.

### `hasCircularDependency(jobName) → boolean`
Detects circular dependency chains using DFS.

### `clearDependencies(jobName)`
Removes all dependencies for a single job.

### `clearAllDependencies()`
Resets the entire dependency map (useful in tests).

## Notes

- Jobs are skipped (not failed) when their dependencies haven't completed yet.
- Circular dependencies are caught and reported as errors before execution.
- Job order in `runWithDependencies` matters — list jobs in the intended execution sequence.
