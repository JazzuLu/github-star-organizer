import test from 'node:test';
import assert from 'node:assert';
import { readCache, writeCache } from '../utils.js';
import fs from 'node:fs';

test('readCache returns empty array if file not exists', () => {
  const tempFile = 'test_cache_non_existent.json';
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
  const data = readCache(tempFile);
  assert.deepEqual(data, []);
});

test('writeCache writes file and readCache reads it back', (t) => {
  const tempFile = 'test_cache.json';
  t.after(() => {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });
  const mockData = [{ id: 1, name: 'test' }];
  writeCache(tempFile, mockData);
  const data = readCache(tempFile);
  assert.deepEqual(data, mockData);
});

test('readCache returns empty array if file is invalid JSON', (t) => {
  const tempFile = 'invalid_test_cache.json';
  t.after(() => {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });
  fs.writeFileSync(tempFile, 'invalid-json-{', 'utf8');
  const data = readCache(tempFile);
  assert.deepEqual(data, []);
});
