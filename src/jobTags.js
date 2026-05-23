/**
 * jobTags.js — Tag management for cron jobs.
 * Allows jobs to be labeled and queried by tag.
 */

const tagMap = new Map();

function addTag(jobName, tag) {
  if (!jobName || !tag) throw new Error('jobName and tag are required');
  if (!tagMap.has(jobName)) {
    tagMap.set(jobName, new Set());
  }
  tagMap.get(jobName).add(tag);
}

function removeTag(jobName, tag) {
  if (!tagMap.has(jobName)) return;
  tagMap.get(jobName).delete(tag);
}

function getTags(jobName) {
  if (!tagMap.has(jobName)) return [];
  return Array.from(tagMap.get(jobName));
}

function getJobsByTag(tag) {
  const results = [];
  for (const [jobName, tags] of tagMap.entries()) {
    if (tags.has(tag)) {
      results.push(jobName);
    }
  }
  return results;
}

function hasTag(jobName, tag) {
  return tagMap.has(jobName) && tagMap.get(jobName).has(tag);
}

function clearTags(jobName) {
  tagMap.delete(jobName);
}

function clearAllTags() {
  tagMap.clear();
}

module.exports = {
  addTag,
  removeTag,
  getTags,
  getJobsByTag,
  hasTag,
  clearTags,
  clearAllTags,
};
