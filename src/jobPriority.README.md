# Job Priority

Assign priority levels to cron jobs so they run in order of importance when queued.

## Priority Levels

| Level        | Value |
|--------------|-------|
| `CRITICAL`   | 1     |
| `HIGH`       | 2     |
| `NORMAL`     | 3     |
| `LOW`        | 4     |
| `BACKGROUND` | 5     |

Lower values run first.

## Usage

```js
const { setPriority, PRIORITY_LEVELS } = require('./jobPriority');
const { enqueue, dequeue } = require('./priorityQueue');

setPriority('billing-sync', PRIORITY_LEVELS.CRITICAL);
setPriority('report-gen', PRIORITY_LEVELS.LOW);

enqueue('main', 'report-gen', reportFn);
enqueue('main', 'billing-sync', billingFn);

const next = dequeue('main');
// next.jobName === 'billing-sync'
await next.fn();
```

## API

### `jobPriority.js`

- `setPriority(jobName, level)` — assign a priority level to a job
- `getPriority(jobName)` — get priority (defaults to `NORMAL`)
- `removePriority(jobName)` — remove priority assignment
- `getJobsByPriority(level)` — list jobs at a given level
- `sortJobsByPriority(jobNames)` — sort an array of job names by priority
- `listPriorities()` — return all current priority assignments

### `priorityQueue.js`

- `enqueue(queueName, jobName, fn)` — add a job to a named queue
- `dequeue(queueName)` — remove and return the highest-priority job
- `peek(queueName)` — inspect the next job without removing it
- `queueSize(queueName)` — number of jobs waiting
- `listQueue(queueName)` — snapshot of the queue
- `clearQueue(queueName)` — empty a specific queue
