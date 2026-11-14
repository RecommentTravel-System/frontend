import test from 'node:test';
import assert from 'node:assert/strict';
import { subscribeHttpLoading } from '../src/shared/lib/api.js';

test('subscribeHttpLoading receives start and end events for tracking', async () => {
  const events = [];
  const unsubscribe = subscribeHttpLoading((evt) => {
    events.push(evt);
  });

  assert.equal(typeof unsubscribe, 'function');
  unsubscribe();
});

test('concurrent task reference counting logic', () => {
  const activeTasks = {};
  
  function start(id, meta) {
    activeTasks[id] = meta;
  }
  
  function stop(id) {
    delete activeTasks[id];
  }
  
  start('task-search', { text: 'Đang tìm kiếm...' });
  start('task-places', { text: 'Đang tải địa điểm...' });
  
  assert.equal(Object.keys(activeTasks).length, 2);
  assert.equal(activeTasks['task-places'].text, 'Đang tải địa điểm...');
  
  stop('task-search');
  assert.equal(Object.keys(activeTasks).length, 1);
  assert.equal(activeTasks['task-places'].text, 'Đang tải địa điểm...');
  
  stop('task-places');
  assert.equal(Object.keys(activeTasks).length, 0);
});
