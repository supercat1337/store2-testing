import { createStore2Context } from '@supercat1337/store2';

// @ts-check


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
function createTestContext(options = {}) {
    return createStore2Context({
        name: 'test',
        ...options,
    });
}

// @ts-check

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
function snapshotDiff(prev, next) {
    if (!prev || typeof prev !== 'object' || !prev.roots) {
        throw new Error('snapshotDiff: prev must be a ContextSnapshot');
    }
    if (!next || typeof next !== 'object' || !next.roots) {
        throw new Error('snapshotDiff: next must be a ContextSnapshot');
    }

    /** @type {string[]} */
    const rootsAdded = [];

    /** @type {string[]} */
    const rootsRemoved = [];

    /** @type {{ [rootName: string]: import('./types.js').SnapshotDiffEntry }} */
    const roots = {};

    const allRootNames = new Set([...Object.keys(prev.roots), ...Object.keys(next.roots)]);

    for (const name of allRootNames) {
        const inPrev = Object.prototype.hasOwnProperty.call(prev.roots, name);
        const inNext = Object.prototype.hasOwnProperty.call(next.roots, name);

        if (inPrev && !inNext) {
            rootsRemoved.push(name);
            continue;
        }
        if (!inPrev && inNext) {
            rootsAdded.push(name);
            continue;
        }

        /** @type {import('./types.js').SnapshotDiffEntry} */
        const entry = {
            added: [],
            removed: [],
            changed: [],
        };

        diffValue(prev.roots[name], next.roots[name], '', entry);

        entry.added.sort();
        entry.removed.sort();
        entry.changed.sort();

        roots[name] = entry;
    }

    rootsAdded.sort();
    rootsRemoved.sort();

    return { roots, rootsAdded, rootsRemoved };
}

/**
 * Recursively diffs two values, appending paths to `entry`.
 *
 * @param {any} prev
 * @param {any} next
 * @param {string} path
 * @param {import('./types.js').SnapshotDiffEntry} entry
 */
function diffValue(prev, next, path, entry) {
    if (prev === next) {
        return;
    }

    // Null, primitives, or a type mismatch (including array vs object).
    // Report the whole subtree as changed at the current path.
    if (
        prev === null ||
        next === null ||
        typeof prev !== 'object' ||
        typeof next !== 'object' ||
        Array.isArray(prev) !== Array.isArray(next)
    ) {
        entry.changed.push(path);
        return;
    }

    if (Array.isArray(prev) && Array.isArray(next)) {
        const maxLen = Math.max(prev.length, next.length);
        for (let i = 0; i < maxLen; i++) {
            const childPath = path === '' ? String(i) : `${path}.${i}`;
            if (i >= prev.length) {
                entry.added.push(childPath);
            } else if (i >= next.length) {
                entry.removed.push(childPath);
            } else {
                diffValue(prev[i], next[i], childPath, entry);
            }
        }
        return;
    }

    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    const nextKeySet = new Set(nextKeys);
    const prevKeySet = new Set(prevKeys);

    for (const key of prevKeys) {
        if (!nextKeySet.has(key)) {
            entry.removed.push(path === '' ? key : `${path}.${key}`);
        }
    }
    for (const key of nextKeys) {
        if (!prevKeySet.has(key)) {
            entry.added.push(path === '' ? key : `${path}.${key}`);
        }
    }
    for (const key of prevKeys) {
        if (nextKeySet.has(key)) {
            diffValue(prev[key], next[key], path === '' ? key : `${path}.${key}`, entry);
        }
    }
}

export { createTestContext, snapshotDiff };
