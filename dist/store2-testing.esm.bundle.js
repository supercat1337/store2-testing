// src/createTestContext.js
import { createStore2Context } from "@supercat1337/store2";
function createTestContext(options = {}) {
  return createStore2Context({
    name: "test",
    ...options
  });
}

// src/snapshotDiff.js
function snapshotDiff(prev, next) {
  if (!prev || typeof prev !== "object" || !prev.roots) {
    throw new Error("snapshotDiff: prev must be a ContextSnapshot");
  }
  if (!next || typeof next !== "object" || !next.roots) {
    throw new Error("snapshotDiff: next must be a ContextSnapshot");
  }
  const rootsAdded = [];
  const rootsRemoved = [];
  const roots = {};
  const allRootNames = /* @__PURE__ */ new Set([...Object.keys(prev.roots), ...Object.keys(next.roots)]);
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
    const entry = {
      added: [],
      removed: [],
      changed: []
    };
    diffValue(prev.roots[name], next.roots[name], "", entry);
    entry.added.sort();
    entry.removed.sort();
    entry.changed.sort();
    roots[name] = entry;
  }
  rootsAdded.sort();
  rootsRemoved.sort();
  return { roots, rootsAdded, rootsRemoved };
}
function diffValue(prev, next, path, entry) {
  if (prev === next) {
    return;
  }
  if (prev === null || next === null || typeof prev !== "object" || typeof next !== "object" || Array.isArray(prev) !== Array.isArray(next)) {
    entry.changed.push(path);
    return;
  }
  if (Array.isArray(prev) && Array.isArray(next)) {
    const maxLen = Math.max(prev.length, next.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = path === "" ? String(i) : `${path}.${i}`;
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
      entry.removed.push(path === "" ? key : `${path}.${key}`);
    }
  }
  for (const key of nextKeys) {
    if (!prevKeySet.has(key)) {
      entry.added.push(path === "" ? key : `${path}.${key}`);
    }
  }
  for (const key of prevKeys) {
    if (nextKeySet.has(key)) {
      diffValue(prev[key], next[key], path === "" ? key : `${path}.${key}`, entry);
    }
  }
}
export {
  createTestContext,
  snapshotDiff
};
