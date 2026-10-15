// @ts-check

/**
 * Options accepted by `createTestContext`.
 *
 * @public
 */
export interface TestContextOptions {
    /**
     * Context name. Used in error messages and DevTools listings.
     * Defaults to `'test'`.
     */
    name?: string;
}

/**
 * Per-root diff entry.
 *
 * Paths are dot-separated. Array indices appear as numeric segments
 * (`'items.0'`, `'items.1'`).
 *
 * @public
 */
export interface SnapshotDiffEntry {
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
 * Structural diff between two `ContextSnapshot` objects.
 *
 * @public
 */
export interface SnapshotDiff {
    /**
     * Per-root diff, keyed by the root name passed to `registerRoot()`.
     * Roots present in only one of the snapshots are not listed here;
     * see `rootsAdded` and `rootsRemoved`.
     */
    roots: { [rootName: string]: SnapshotDiffEntry };

    /**
     * Names of roots present in `next` but absent in `prev`.
     */
    rootsAdded: string[];

    /**
     * Names of roots present in `prev` but absent in `next`.
     */
    rootsRemoved: string[];
}
