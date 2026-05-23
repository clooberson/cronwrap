const {
  registerMiddleware,
  getMiddleware,
  listMiddlewares,
  getAllMiddlewares,
  removeMiddleware,
  clearMiddlewares,
} = require('./middlewareRegistry');

beforeEach(() => clearMiddlewares());

describe('registerMiddleware', () => {
  it('registers a middleware by name', () => {
    const fn = async (ctx, next) => next();
    registerMiddleware('auth', fn);
    expect(getMiddleware('auth')).toBe(fn);
  });

  it('overwrites existing middleware with same name', () => {
    const fn1 = async () => {};
    const fn2 = async () => {};
    registerMiddleware('log', fn1);
    registerMiddleware('log', fn2);
    expect(getMiddleware('log')).toBe(fn2);
  });

  it('throws if fn is not a function', () => {
    expect(() => registerMiddleware('bad', 'nope')).toThrow('must be a function');
  });
});

describe('listMiddlewares', () => {
  it('returns empty array when none registered', () => {
    expect(listMiddlewares()).toEqual([]);
  });

  it('returns names in registration order', () => {
    registerMiddleware('a', async () => {});
    registerMiddleware('b', async () => {});
    expect(listMiddlewares()).toEqual(['a', 'b']);
  });
});

describe('getAllMiddlewares', () => {
  it('returns all middleware functions', () => {
    const fn1 = async () => {};
    const fn2 = async () => {};
    registerMiddleware('x', fn1);
    registerMiddleware('y', fn2);
    expect(getAllMiddlewares()).toEqual([fn1, fn2]);
  });
});

describe('removeMiddleware', () => {
  it('removes a middleware by name', () => {
    registerMiddleware('tmp', async () => {});
    removeMiddleware('tmp');
    expect(getMiddleware('tmp')).toBeUndefined();
  });

  it('does nothing if name not found', () => {
    expect(() => removeMiddleware('ghost')).not.toThrow();
  });
});

describe('clearMiddlewares', () => {
  it('removes all middlewares', () => {
    registerMiddleware('a', async () => {});
    registerMiddleware('b', async () => {});
    clearMiddlewares();
    expect(listMiddlewares()).toEqual([]);
  });
});
