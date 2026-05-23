/**
 * Global middleware registry for cronwrap.
 * Allows registering named global middlewares applied to all jobs.
 */

const registry = new Map();

/**
 * Register a named global middleware.
 * @param {string} name
 * @param {Function} fn - async (ctx, next) => void
 */
function registerMiddleware(name, fn) {
  if (typeof fn !== 'function') throw new Error(`Middleware "${name}" must be a function`);
  registry.set(name, fn);
}

/**
 * Get a registered middleware by name.
 * @param {string} name
 * @returns {Function|undefined}
 */
function getMiddleware(name) {
  return registry.get(name);
}

/**
 * List all registered middleware names.
 * @returns {string[]}
 */
function listMiddlewares() {
  return Array.from(registry.keys());
}

/**
 * Get all registered middleware functions in registration order.
 * @returns {Function[]}
 */
function getAllMiddlewares() {
  return Array.from(registry.values());
}

/**
 * Remove a middleware by name.
 * @param {string} name
 */
function removeMiddleware(name) {
  registry.delete(name);
}

/**
 * Clear all registered middlewares.
 */
function clearMiddlewares() {
  registry.clear();
}

module.exports = {
  registerMiddleware,
  getMiddleware,
  listMiddlewares,
  getAllMiddlewares,
  removeMiddleware,
  clearMiddlewares,
};
