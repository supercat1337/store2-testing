// @ts-check

import { createStore2Context } from '@supercat1337/store2';

/**
 * Creates an isolated `Store2Context` for tests.
 *
 * The returned context has its own services — ID generation, batching,
 * dependency tracking — so tests never leak state into each other. The
 * default name is `'test'`.
 *
 * Always dispose the context when the test finishes:
 *
 *     const ctx = createTestContext();
 *     t.teardown(() => ctx.dispose());
 *
 * Reactive items created inside `runWithContext(ctx, ...)` bind to this
 * context. Items created at module top level bind to the default context
 * and are not visible to `ctx.snapshot()` or `ctx.dumpGraph()`.
 *
 * @param {import('./types.js').TestContextOptions} [options]
 * @returns {import('@supercat1337/store2').Store2Context}
 */
export function createTestContext(options = {}) {
    return createStore2Context({
        name: 'test',
        ...options,
    });
}
