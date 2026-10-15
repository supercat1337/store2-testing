# @supercat1337/store2-testing

Testing utilities for [`@supercat1337/store2`](https://www.npmjs.com/package/@supercat1337/store2).

Provides isolated test contexts and structural snapshot diffing for
assertions.

## Installation

```bash
npm install --save-dev @supercat1337/store2 @supercat1337/store2-testing
```

## Usage

### `createTestContext(options?)`

Creates an isolated `Store2Context` for a single test. Each call returns
a fresh context with its own services, so tests never leak state into
each other.

```js
import test from 'ava';
import { atom, runWithContext } from '@supercat1337/store2';
import { createTestContext } from '@supercat1337/store2-testing';

test('counter increments', t => {
    const ctx = createTestContext();
    t.teardown(() => ctx.dispose());

    runWithContext(ctx, () => {
        const count = atom(0);
        t.is(count.value, 0);
        count.value++;
        t.is(count.value, 1);
    });
});
```

**Always call `ctx.dispose()`** in teardown. Even though each context is
isolated, disposing releases subscriptions, plugins, and registered roots.

### `snapshotDiff(prev, next)`

Computes a structural diff between two `ContextSnapshot` objects, as
returned by `context.snapshot()`.

```js
import { createTestContext, snapshotDiff } from '@supercat1337/store2-testing';

const ctx = createTestContext();
// ... set up store, register roots ...

const before = ctx.snapshot();
count.value = 5;
const after = ctx.snapshot();

const diff = snapshotDiff(before, after);
// {
//   roots: {
//     app: {
//       added: [],
//       removed: [],
//       changed: ['items.count.value']
//     }
//   },
//   rootsAdded: [],
//   rootsRemoved: []
// }
```

Paths are dot-separated. Array indices appear as numeric segments
(`'items.0'`, `'items.1'`).

When a value's type changes (for example, an object becomes a primitive,
or an array becomes an object), the whole subtree is reported as changed
at the shallowest differing path.

## API

### `createTestContext(options?): Store2Context`

Options:

- `name?: string` — context name. Defaults to `'test'`.

### `snapshotDiff(prev, next): SnapshotDiff`

Throws if either argument is not a `ContextSnapshot`.

`SnapshotDiff` shape:

```ts
interface SnapshotDiff {
    roots: {
        [rootName: string]: {
            added: string[];
            removed: string[];
            changed: string[];
        };
    };
    rootsAdded: string[];
    rootsRemoved: string[];
}
```

## License

MIT © 2025–2026 Albert Bazaleev
