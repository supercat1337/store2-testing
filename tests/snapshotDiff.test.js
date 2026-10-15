// @ts-check

import test from 'ava';
import { atom, runWithContext, Store } from '@supercat1337/store2';
import { createTestContext, snapshotDiff } from '../src/index.js';

/**
 * @param {Record<string, any>} roots
 */
function snap(roots) {
    return { version: 1, timestamp: 0, roots };
}

test('snapshotDiff: identical snapshots produce empty diff', t => {
    const diff = snapshotDiff(snap({ app: { x: 1 } }), snap({ app: { x: 1 } }));
    t.deepEqual(diff.rootsAdded, []);
    t.deepEqual(diff.rootsRemoved, []);
    t.deepEqual(diff.roots.app, { added: [], removed: [], changed: [] });
});

test('snapshotDiff: detects added root', t => {
    const diff = snapshotDiff(snap({}), snap({ app: { x: 1 } }));
    t.deepEqual(diff.rootsAdded, ['app']);
    t.deepEqual(diff.rootsRemoved, []);
    t.is(diff.roots.app, undefined);
});

test('snapshotDiff: detects removed root', t => {
    const diff = snapshotDiff(snap({ app: { x: 1 } }), snap({}));
    t.deepEqual(diff.rootsAdded, []);
    t.deepEqual(diff.rootsRemoved, ['app']);
});

test('snapshotDiff: detects top-level key change', t => {
    const diff = snapshotDiff(snap({ app: { x: 1, y: 2 } }), snap({ app: { x: 1, y: 3 } }));
    t.deepEqual(diff.roots.app.changed, ['y']);
    t.deepEqual(diff.roots.app.added, []);
    t.deepEqual(diff.roots.app.removed, []);
});

test('snapshotDiff: detects nested key change', t => {
    const diff = snapshotDiff(
        snap({ app: { user: { name: 'Alex', age: 30 } } }),
        snap({ app: { user: { name: 'Alex', age: 31 } } })
    );
    t.deepEqual(diff.roots.app.changed, ['user.age']);
});

test('snapshotDiff: detects added nested key', t => {
    const diff = snapshotDiff(
        snap({ app: { user: { name: 'Alex' } } }),
        snap({ app: { user: { name: 'Alex', age: 30 } } })
    );
    t.deepEqual(diff.roots.app.added, ['user.age']);
});

test('snapshotDiff: detects removed nested key', t => {
    const diff = snapshotDiff(
        snap({ app: { user: { name: 'Alex', age: 30 } } }),
        snap({ app: { user: { name: 'Alex' } } })
    );
    t.deepEqual(diff.roots.app.removed, ['user.age']);
});

test('snapshotDiff: array element changed, added, removed', t => {
    const diff = snapshotDiff(
        snap({ app: { items: [1, 2, 3] } }),
        snap({ app: { items: [1, 5, 3, 4] } })
    );
    t.deepEqual(diff.roots.app.changed, ['items.1']);
    t.deepEqual(diff.roots.app.added, ['items.3']);
    t.deepEqual(diff.roots.app.removed, []);
});

test('snapshotDiff: array shortened reports removed tail indices', t => {
    const diff = snapshotDiff(
        snap({ app: { items: [1, 2, 3] } }),
        snap({ app: { items: [1, 2] } })
    );
    t.deepEqual(diff.roots.app.removed, ['items.2']);
});

test('snapshotDiff: type change reports whole path', t => {
    const diff = snapshotDiff(snap({ app: { x: { nested: 1 } } }), snap({ app: { x: 42 } }));
    t.deepEqual(diff.roots.app.changed, ['x']);
});

test('snapshotDiff: array to object reports whole path', t => {
    const diff = snapshotDiff(snap({ app: { x: [1, 2] } }), snap({ app: { x: { 0: 1, 1: 2 } } }));
    t.deepEqual(diff.roots.app.changed, ['x']);
});

test('snapshotDiff: null to value reports change', t => {
    const diff = snapshotDiff(snap({ app: { x: null } }), snap({ app: { x: 1 } }));
    t.deepEqual(diff.roots.app.changed, ['x']);
});

test('snapshotDiff: throws on invalid input', t => {
    t.throws(() => snapshotDiff(null, snap({})), { message: /prev/ });
    t.throws(() => snapshotDiff(snap({}), null), { message: /next/ });
    t.throws(() => snapshotDiff({}, snap({})), { message: /prev/ });
    t.throws(() => snapshotDiff(snap({}), {}), { message: /next/ });
});

test('snapshotDiff: works with real Store snapshots', t => {
    const ctx = createTestContext();

    /** @type {Store} */
    let store;
    /** @type {import('@supercat1337/store2').Atom<number>} */
    let count;

    runWithContext(ctx, () => {
        store = new Store();
        count = atom(0, { name: 'count' });
        store.addItems({ count });
        ctx.registerRoot('app', store);
    });

    const before = ctx.snapshot();
    count.value = 5;
    const after = ctx.snapshot();

    const diff = snapshotDiff(before, after);

    t.deepEqual(diff.rootsAdded, []);
    t.deepEqual(diff.rootsRemoved, []);
    t.deepEqual(diff.roots.app.changed, ['items.count.value']);
    t.deepEqual(diff.roots.app.added, []);
    t.deepEqual(diff.roots.app.removed, []);

    ctx.dispose();
});
