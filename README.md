# cronwrap

Lightweight wrapper that adds logging, alerting, and retry logic to any cron job.

## Installation

```bash
npm install cronwrap
```

## Usage

Wrap any function with `cronwrap` to automatically get structured logging, failure alerts, and configurable retry behavior.

```javascript
const cronwrap = require('cronwrap');

const job = cronwrap({
  name: 'daily-report',
  retries: 3,
  onFailure: (err) => sendAlert(`Job failed: ${err.message}`),
  task: async () => {
    // your cron job logic here
    await generateDailyReport();
  },
});

// Schedule with your preferred cron library
cron.schedule('0 9 * * *', job.run);
```

### Options

| Option | Type | Description |
|---|---|---|
| `name` | `string` | Identifier used in log output |
| `retries` | `number` | Number of retry attempts on failure (default: `0`) |
| `onFailure` | `function` | Callback invoked when all attempts fail |
| `task` | `function` | The async function to execute |

### What you get out of the box

- ✅ Structured console logging with timestamps
- 🔁 Automatic retry with exponential backoff
- 🚨 Failure callbacks for alerting integrations
- ⏱️ Execution duration tracking

## License

MIT