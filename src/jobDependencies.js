/**
 * jobDependencies.js
 * Track dependencies between jobs — a job can depend on other jobs completing first.
 */

const dependencyMap = new Map();

function getOrInitDeps(jobName) {
  if (!dependencyMap.has(jobName)) {
    dependencyMap.set(jobName, new Set());
  }
  return dependencyMap.get(jobName);
}

function addDependency(jobName, dependsOn) {
  if (jobName === dependsOn) throw new Error(`Job "${jobName}" cannot depend on itself`);
  const deps = getOrInitDeps(jobName);
  deps.add(dependsOn);
}

function removeDependency(jobName, dependsOn) {
  const deps = dependencyMap.get(jobName);
  if (deps) deps.delete(dependsOn);
}

function getDependencies(jobName) {
  const deps = dependencyMap.get(jobName);
  return deps ? [...deps] : [];
}

function hasDependency(jobName, dependsOn) {
  const deps = dependencyMap.get(jobName);
  return deps ? deps.has(dependsOn) : false;
}

function clearDependencies(jobName) {
  dependencyMap.delete(jobName);
}

function clearAllDependencies() {
  dependencyMap.clear();
}

/**
 * Returns true if all dependencies for jobName are present in completedJobs set.
 */
function areDependenciesMet(jobName, completedJobs = new Set()) {
  const deps = getDependencies(jobName);
  return deps.every((dep) => completedJobs.has(dep));
}

/**
 * Detects circular dependencies using DFS.
 */
function hasCircularDependency(jobName, visited = new Set(), stack = new Set()) {
  visited.add(jobName);
  stack.add(jobName);
  for (const dep of getDependencies(jobName)) {
    if (!visited.has(dep) && hasCircularDependency(dep, visited, stack)) return true;
    if (stack.has(dep)) return true;
  }
  stack.delete(jobName);
  return false;
}

module.exports = {
  addDependency,
  removeDependency,
  getDependencies,
  hasDependency,
  clearDependencies,
  clearAllDependencies,
  areDependenciesMet,
  hasCircularDependency,
};
