// Priority-aware job queue for ordered execution
const { getPriority } = require('./jobPriority');

const queues = new Map();

function getOrInitQueue(queueName) {
  if (!queues.has(queueName)) {
    queues.set(queueName, []);
  }
  return queues.get(queueName);
}

function enqueue(queueName, jobName, fn) {
  const queue = getOrInitQueue(queueName);
  const priority = getPriority(jobName);
  queue.push({ jobName, fn, priority, enqueuedAt: Date.now() });
  queue.sort((a, b) => a.priority - b.priority || a.enqueuedAt - b.enqueuedAt);
}

function dequeue(queueName) {
  const queue = getOrInitQueue(queueName);
  return queue.shift() ?? null;
}

function peek(queueName) {
  const queue = getOrInitQueue(queueName);
  return queue[0] ?? null;
}

function queueSize(queueName) {
  return getOrInitQueue(queueName).length;
}

function clearQueue(queueName) {
  queues.set(queueName, []);
}

function clearAllQueues() {
  queues.clear();
}

function listQueue(queueName) {
  return [...getOrInitQueue(queueName)];
}

module.exports = {
  enqueue,
  dequeue,
  peek,
  queueSize,
  clearQueue,
  clearAllQueues,
  listQueue
};
