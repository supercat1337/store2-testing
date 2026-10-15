// @ts-check

import test from 'ava';
import { atom, runWithContext } from '@supercat1337/store2';
import { createTestContext } from '../src/index.js';

test('createTestContext: name defaults to "test"', t => {
    const ctx = createTestContext();
    t.is(ctx.name, 'test');
    ctx.dispose();
});

test('createTestContext: custom name overrides default', t => {
    const ctx = createTestContext({ name: 'my-test' });
    t.is(ctx.name, 'my-test');
    ctx.dispose();
});

test('createTestContext: returns isolated services per call', t => {
    const a = createTestContext();
    const b = createTestContext();

    t.not(a.idService, b.idService);
    t.not(a.modeController, b.modeController);
    t.not(a.dependencyTracker, b.dependencyTracker);
    t.not(a.changedItemsController, b.changedItemsController);

    a.dispose();
    b.dispose();
});

test('createTestContext: items bind to the test context', t => {
    const ctx = createTestContext();

    runWithContext(ctx, () => {
        const a = atom(0);
        t.is(a.engine.context, ctx);
    });

    ctx.dispose();
});

test('createTestContext: items from different contexts are isolated', t => {
    const a = createTestContext();
    const b = createTestContext();

    runWithContext(a, () => atom(0));
    runWithContext(b, () => atom(0));

    // Each context has exactly one item in its registry.
    t.is(a.dumpGraph().items.length, 1);
    t.is(b.dumpGraph().items.length, 1);

    a.dispose();
    b.dispose();
});

test('createTestContext: dispose clears roots', t => {
    const ctx = createTestContext();

    ctx.registerRoot('app', {
        serialize: () => null,
        hydrate: () => {},
    });

    t.is(ctx.getRootNames().length, 1);
    ctx.dispose();
    t.is(ctx.getRootNames().length, 0);
});
