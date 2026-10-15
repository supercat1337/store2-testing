/**
 * Testing utilities for `@supercat1337/store2`.
 *
 * Provides `createTestContext()` for isolated test contexts and
 * `snapshotDiff()` for structural comparison of context snapshots.
 *
 * @packageDocumentation
 */

export { createTestContext } from './createTestContext.js';
export { snapshotDiff } from './snapshotDiff.js';

export type { TestContextOptions, SnapshotDiff, SnapshotDiffEntry } from './types.js';
