const test = require('node:test');
const assert = require('node:assert/strict');

const geometry = require('../contents/code/geometry.js');

test('clampGap returns default for invalid values', () => {
  assert.equal(geometry.clampGap(undefined), 8);
  assert.equal(geometry.clampGap('abc'), 8);
});

test('clampGap rounds and clamps negative values', () => {
  assert.equal(geometry.clampGap(7.6), 8);
  assert.equal(geometry.clampGap(-5), 0);
});

test('detects fully maximized via horizontal and vertical flags', () => {
  assert.equal(geometry.isFullyMaximized({ maximizedHorizontally: true, maximizedVertically: true }), true);
  assert.equal(geometry.isFullyMaximized({ maximizedHorizontally: true, maximizedVertically: false }), false);
});

test('detects fully maximized via maximizeMode fallback', () => {
  assert.equal(geometry.isFullyMaximized({ maximizeMode: 3 }), true);
  assert.equal(geometry.isFullyMaximized({ maximizeMode: 2 }), false);
});

test('computes inset geometry for maximized windows', () => {
  assert.deepEqual(
    geometry.targetGeometryForMaximized({ x: 0, y: 0, width: 1920, height: 1080 }, 8),
    { x: 8, y: 8, width: 1904, height: 1064 }
  );
});

test('moves floating window away from left edge without resizing', () => {
  assert.deepEqual(
    geometry.targetGeometryForFloating(
      { x: 0, y: 100, width: 800, height: 600 },
      { x: 0, y: 0, width: 1920, height: 1080 },
      8
    ),
    { x: 8, y: 100, width: 800, height: 600 }
  );
});

test('moves floating window away from right edge without resizing', () => {
  assert.deepEqual(
    geometry.targetGeometryForFloating(
      { x: 1120, y: 100, width: 800, height: 600 },
      { x: 0, y: 0, width: 1920, height: 1080 },
      8
    ),
    { x: 1112, y: 100, width: 800, height: 600 }
  );
});

test('does not move fullscreen-sized floating window touching both horizontal edges', () => {
  assert.equal(
    geometry.targetGeometryForFloating(
      { x: 0, y: 100, width: 1920, height: 600 },
      { x: 0, y: 0, width: 1920, height: 1080 },
      8
    ),
    null
  );
});

test('returns null when window does not touch any edge', () => {
  assert.equal(
    geometry.targetGeometryForFloating(
      { x: 100, y: 100, width: 800, height: 600 },
      { x: 0, y: 0, width: 1920, height: 1080 },
      8
    ),
    null
  );
});

test('moves floating window from previous gap offset to new gap', () => {
  assert.deepEqual(
    geometry.targetGeometryForFloating(
      { x: 8, y: 100, width: 800, height: 600 },
      { x: 0, y: 0, width: 1920, height: 1080 },
      24,
      8
    ),
    { x: 24, y: 100, width: 800, height: 600 }
  );
});

test('moves floating window from previous right gap offset to new gap', () => {
  assert.deepEqual(
    geometry.targetGeometryForFloating(
      { x: 1112, y: 100, width: 800, height: 600 },
      { x: 0, y: 0, width: 1920, height: 1080 },
      24,
      8
    ),
    { x: 1096, y: 100, width: 800, height: 600 }
  );
});
