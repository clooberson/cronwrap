// Per-job retry policy configuration
// Stores named retry policies and per-job policy assignments

const policies = {};
const jobPolicies = {};

const DEFAULT_POLICY = {
  maxAttempts: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
  maxBackoffMs: 30000,
};

function definePolicy(name, options = {}) {
  if (!name || typeof name !== 'string') throw new Error('Policy name must be a non-empty string');
  policies[name] = { ...DEFAULT_POLICY, ...options, name };
  return policies[name];
}

function getPolicy(name) {
  return policies[name] || null;
}

function assignPolicy(jobId, policyName) {
  if (!policies[policyName]) throw new Error(`Policy '${policyName}' is not defined`);
  jobPolicies[jobId] = policyName;
}

function getJobPolicy(jobId) {
  const name = jobPolicies[jobId];
  if (!name) return { ...DEFAULT_POLICY, name: 'default' };
  return policies[name];
}

function removePolicy(name) {
  delete policies[name];
  for (const jobId of Object.keys(jobPolicies)) {
    if (jobPolicies[jobId] === name) delete jobPolicies[jobId];
  }
}

function listPolicies() {
  return Object.values(policies);
}

function computeBackoff(policy, attempt) {
  const delay = policy.backoffMs * Math.pow(policy.backoffMultiplier, attempt - 1);
  return Math.min(delay, policy.maxBackoffMs);
}

function clearAll() {
  Object.keys(policies).forEach(k => delete policies[k]);
  Object.keys(jobPolicies).forEach(k => delete jobPolicies[k]);
}

module.exports = {
  definePolicy,
  getPolicy,
  assignPolicy,
  getJobPolicy,
  removePolicy,
  listPolicies,
  computeBackoff,
  clearAll,
  DEFAULT_POLICY,
};
