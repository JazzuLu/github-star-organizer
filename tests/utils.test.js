import test from 'node:test';
import assert from 'node:assert';
import { readCache, writeCache } from '../utils.js';
import fs from 'node:fs';

test('readCache returns empty array if file not exists', () => {
  if (fs.existsSync('test_cache.json')) {
    fs.unlinkSync('test_cache.json');
  }
  const data = readCache('test_cache.json');
  assert.deepEqual(data, []);
});

test('writeCache writes file and readCache reads it back', () => {
  const mockData = [{ id: 1, name: 'test' }];
  writeCache('test_cache.json', mockData);
  const data = readCache('test_cache.json');
  assert.deepEqual(data, mockData);
  fs.unlinkSync('test_cache.json');
});
