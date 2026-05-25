// jobAnnotations.js — attach arbitrary key/value metadata to jobs

const store = new Map();

function getOrInitAnnotations(jobId) {
  if (!store.has(jobId)) {
    store.set(jobId, {});
  }
  return store.get(jobId);
}

function annotate(jobId, key, value) {
  if (!jobId || !key) throw new Error('jobId and key are required');
  const annotations = getOrInitAnnotations(jobId);
  annotations[key] = value;
}

function getAnnotation(jobId, key) {
  const annotations = getOrInitAnnotations(jobId);
  return annotations[key];
}

function getAnnotations(jobId) {
  return { ...getOrInitAnnotations(jobId) };
}

function removeAnnotation(jobId, key) {
  const annotations = getOrInitAnnotations(jobId);
  delete annotations[key];
}

function clearAnnotations(jobId) {
  store.set(jobId, {});
}

function getJobsByAnnotation(key, value) {
  const results = [];
  for (const [jobId, annotations] of store.entries()) {
    if (value === undefined) {
      if (key in annotations) results.push(jobId);
    } else {
      if (annotations[key] === value) results.push(jobId);
    }
  }
  return results;
}

function resetAllAnnotations() {
  store.clear();
}

module.exports = {
  annotate,
  getAnnotation,
  getAnnotations,
  removeAnnotation,
  clearAnnotations,
  getJobsByAnnotation,
  resetAllAnnotations,
};
