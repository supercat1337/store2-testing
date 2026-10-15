/**
 * Testing utilities for `@supercat1337/store2`.
 *
 * Provides `createTestContext()` for isolated test contexts and
 * `snapshotDiff()` for structural comparison of context snapshots.
 *
 * @packageDocumentation
 */

import { ContextSnapshot } from '@supercat1337/store2';
import { Store2Context } from '@supercat1337/store2';

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
export declare function createTestContext(options?: TestContextOptions): Store2Context;

/**
 * Structural diff between two `ContextSnapshot` objects.
 *
 * @public
 */
export declare interface SnapshotDiff {
    /**
     * Per-root diff, keyed by the root name passed to `registerRoot()`.
     * Roots present in only one of the snapshots are not listed here;
     * see `rootsAdded` and `rootsRemoved`.
     */
    roots: {
        [rootName: string]: SnapshotDiffEntry;
    };
    /**
     * Names of roots present in `next` but absent in `prev`.
     */
    rootsAdded: string[];
    /**
     * Names of roots present in `prev` but absent in `next`.
     */
    rootsRemoved: string[];
}

/**
 * Computes a structural diff between two context snapshots.
 *
 * Reports the shallowest paths at which values differ — once a subtree
 * is fully added or removed, its children are not enumerated
 * individually. When a value's type changes (object becomes primitive,
 * array becomes object), the whole subtree is reported as changed at
 * the parent path.
 *
 * @param {import('@supercat1337/store2').ContextSnapshot} prev
 * @param {import('@supercat1337/store2').ContextSnapshot} next
 * @returns {import('./types.js').SnapshotDiff}
 */
export declare function snapshotDiff(prev: ContextSnapshot, next: ContextSnapshot): SnapshotDiff;

/**
 * Per-root diff entry.
 *
 * Paths are dot-separated. Array indices appear as numeric segments
 * (`'items.0'`, `'items.1'`).
 *
 * @public
 */
export declare interface SnapshotDiffEntry {
    /**
     * Dotted paths of keys present in `next` but absent in `prev`.
     */
    added: string[];
    /**
     * Dotted paths of keys present in `prev` but absent in `next`.
     */
    removed: string[];
    /**
     * Dotted paths of keys whose values differ between `prev` and `next`.
     */
    changed: string[];
}

/**
 * Options accepted by `createTestContext`.
 *
 * @public
 */
export declare interface TestContextOptions {
    /**
     * Context name. Used in error messages and DevTools listings.
     * Defaults to `'test'`.
     */
    name?: string;
}

export { }
