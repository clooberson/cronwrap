# jobTags

Simple tag system for labeling and querying cron jobs.

## Usage

```js
const { addTag, getTags, getJobsByTag, hasTag, removeTag, clearTags } = require('./jobTags');

// Tag a job
addTag('backup', 'critical');
addTag('backup', 'nightly');
addTag('cleanup', 'nightly');

// Get all tags for a job
getTags('backup'); // ['critical', 'nightly']

// Find all jobs with a specific tag
getJobsByTag('nightly'); // ['backup', 'cleanup']

// Check if a job has a tag
hasTag('backup', 'critical'); // true

// Remove a tag
removeTag('backup', 'nightly');

// Clear all tags for a job
clearTags('backup');
```

## API

| Function | Description |
|---|---|
| `addTag(jobName, tag)` | Add a tag to a job |
| `removeTag(jobName, tag)` | Remove a tag from a job |
| `getTags(jobName)` | Get all tags for a job |
| `getJobsByTag(tag)` | Get all jobs with a given tag |
| `hasTag(jobName, tag)` | Check if a job has a specific tag |
| `clearTags(jobName)` | Remove all tags from a job |
| `clearAllTags()` | Reset all tag data (useful in tests) |

## Notes

- Tags are stored in memory and reset on process restart.
- Duplicate tags are silently ignored.
- Pairs well with `scheduler.js` to filter or group scheduled jobs.
