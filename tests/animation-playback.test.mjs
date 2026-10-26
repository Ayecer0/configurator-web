import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampAnimationTime, isPlayableClip } from '../src/configurator/animation/playback.ts';

function makeClip(times, values) {
  return { duration: times.at(-1) || 0, tracks: [{ times, values, getValueSize: () => 1 }] };
}

test('single-key exported static poses are not playable', () => {
  const clip = makeClip([1 / 30], [4]);
  assert.equal(isPlayableClip(clip), false);
});

test('repeated identical poses are not playable', () => {
  assert.equal(isPlayableClip(makeClip([0, 1, 2], [4, 4, 4])), false);
});

test('a moving clip is playable', () => {
  assert.equal(isPlayableClip(makeClip([0, 0.5, 2], [4, 5, 4])), true);
});

test('clips with invalid or zero duration are rejected', () => {
  assert.equal(isPlayableClip({ duration: 0, tracks: [] }), false);
  assert.equal(isPlayableClip({ duration: NaN, tracks: [] }), false);
});

test('seek times are clamped and invalid times are ignored', () => {
  assert.equal(clampAnimationTime(2.1, 2), 2);
  assert.equal(clampAnimationTime(-0.3, 2), 0);
  assert.equal(clampAnimationTime(0.75, 2), 0.75);
  assert.equal(clampAnimationTime(NaN, 2), 0);
  assert.equal(clampAnimationTime(1, 0), 0);
});
