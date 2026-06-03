import test from 'node:test';
import assert from 'node:assert';
import { mergeStars } from '../sync.js';

test('mergeStars merges new stars without losing category and tags', () => {
  const existing = [
    { id: 1, name: 'foo/bar', category: 'Testing', tags: ['Unit'] }
  ];
  const incoming = [
    { id: 1, name: 'foo/bar' },
    { id: 2, name: 'hello/world' }
  ];
  const result = mergeStars(existing, incoming);
  assert.equal(result.length, 2);
  assert.equal(result.find(r => r.id === 1).category, 'Testing');
  assert.deepEqual(result.find(r => r.id === 1).tags, ['Unit']);
  assert.equal(result.find(r => r.id === 2).category, undefined);
});

test('mergeStars propagates deletions (items not in incoming are removed)', () => {
  const existing = [
    { id: 1, name: 'foo/bar', category: 'Testing', tags: ['Unit'] },
    { id: 2, name: 'hello/world', category: 'General', tags: [] }
  ];
  const incoming = [
    { id: 1, name: 'foo/bar' }
  ];
  const result = mergeStars(existing, incoming);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test('mergeStars handles non-array existing cache gracefully', () => {
  const existing = { error: 'invalid data structure' };
  const incoming = [
    { id: 1, name: 'foo/bar' }
  ];
  const result = mergeStars(existing, incoming);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
  assert.equal(result[0].category, undefined);
});

test('mergeStars handles empty incoming array', () => {
  const existing = [
    { id: 1, name: 'foo/bar', category: 'Testing' }
  ];
  const incoming = [];
  const result = mergeStars(existing, incoming);
  assert.equal(result.length, 0);
});
