// notifications.js — send job status notifications via configurable channels

const CHANNELS = {};

function registerChannel(name, handler) {
  if (typeof handler !== 'function') {
    throw new Error(`Channel handler for "${name}" must be a function`);
  }
  CHANNELS[name] = handler;
}

function getChannel(name) {
  return CHANNELS[name] || null;
}

function listChannels() {
  return Object.keys(CHANNELS);
}

async function notify(channelName, event) {
  const handler = CHANNELS[channelName];
  if (!handler) {
    throw new Error(`No channel registered with name "${channelName}"`);
  }
  await handler(event);
}

async function notifyAll(event) {
  const results = [];
  for (const [name, handler] of Object.entries(CHANNELS)) {
    try {
      await handler(event);
      results.push({ channel: name, ok: true });
    } catch (err) {
      results.push({ channel: name, ok: false, error: err.message });
    }
  }
  return results;
}

function clearChannels() {
  for (const key of Object.keys(CHANNELS)) {
    delete CHANNELS[key];
  }
}

module.exports = {
  registerChannel,
  getChannel,
  listChannels,
  notify,
  notifyAll,
  clearChannels,
};
