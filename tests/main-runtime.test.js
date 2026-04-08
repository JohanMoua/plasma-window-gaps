const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('main.js loads in a KWin-like runtime without require', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'contents', 'code', 'main.js'), 'utf8');

  const noopSignal = {
    connect() {}
  };

  class MockTimer {
    constructor() {
      this.timeout = noopSignal;
    }
    setInterval() {}
    start() {}
  }

  const context = {
    Set,
    Math,
    Number,
    Boolean,
    isFinite,
    readConfig() {
      return 8;
    },
    KWin: {
      MaximizeArea: 0
    },
    QTimer: MockTimer,
    workspace: {
      windowAdded: noopSignal,
      windowRemoved: noopSignal,
      windowList() {
        return [];
      },
      clientArea() {
        return { x: 0, y: 0, width: 1920, height: 1080 };
      }
    }
  };

  assert.doesNotThrow(() => {
    vm.runInNewContext(source, context, { filename: 'main.js' });
  });
});
