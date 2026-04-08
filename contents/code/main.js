var geometry = (function () {
    if (typeof require === "function") {
        return require("./geometry.js");
    }

    function sameValue(a, b) {
        return Math.abs(a - b) < 0.5;
    }

    function sameGeometry(a, b) {
        return sameValue(a.x, b.x)
            && sameValue(a.y, b.y)
            && sameValue(a.width, b.width)
            && sameValue(a.height, b.height);
    }

    function roundedGeometry(rect) {
        return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.max(1, Math.round(rect.width)),
            height: Math.max(1, Math.round(rect.height))
        };
    }

    function clampGap(value) {
        var number = Number(value);

        if (!isFinite(number)) {
            return 8;
        }

        number = Math.round(number);
        if (number < 0) {
            return 0;
        }

        return number;
    }

    function isFullyMaximized(window) {
        if (typeof window.maximizedHorizontally !== "undefined" && typeof window.maximizedVertically !== "undefined") {
            return Boolean(window.maximizedHorizontally && window.maximizedVertically);
        }

        return Boolean((window.maximizeMode & 1) && (window.maximizeMode & 2));
    }

    function targetGeometryForMaximized(screen, gap) {
        return roundedGeometry({
            x: screen.x + gap,
            y: screen.y + gap,
            width: screen.width - gap * 2,
            height: screen.height - gap * 2
        });
    }

    function targetGeometryForFloating(frameGeometry, screen, gap) {
        var geometry = roundedGeometry(frameGeometry);
        var touchesLeft = sameValue(geometry.x, screen.x);
        var touchesTop = sameValue(geometry.y, screen.y);
        var touchesRight = sameValue(geometry.x + geometry.width, screen.x + screen.width);
        var touchesBottom = sameValue(geometry.y + geometry.height, screen.y + screen.height);
        var moved = false;

        if (touchesLeft && !touchesRight) {
            geometry.x = Math.round(screen.x + gap);
            moved = true;
        }

        if (touchesTop && !touchesBottom) {
            geometry.y = Math.round(screen.y + gap);
            moved = true;
        }

        if (touchesRight && !touchesLeft) {
            geometry.x = Math.round(screen.x + screen.width - geometry.width - gap);
            moved = true;
        }

        if (touchesBottom && !touchesTop) {
            geometry.y = Math.round(screen.y + screen.height - geometry.height - gap);
            moved = true;
        }

        return moved ? geometry : null;
    }

    return {
        sameValue: sameValue,
        sameGeometry: sameGeometry,
        roundedGeometry: roundedGeometry,
        clampGap: clampGap,
        isFullyMaximized: isFullyMaximized,
        targetGeometryForMaximized: targetGeometryForMaximized,
        targetGeometryForFloating: targetGeometryForFloating
    };
})();
var updatingWindows = new Set();
var connectedWindows = new Set();
var knownGapSize = readGapSize();

function readGapSize() {
    return geometry.clampGap(readConfig("gapSize", 8));
}

function isManagedWindow(window) {
    if (!window || window.deleted === true) {
        return false;
    }

    if (window.fullScreen === true) {
        return false;
    }

    if (window.managed === false || window.specialWindow === true || window.popupWindow === true || window.outline === true) {
        return false;
    }

    if (window.inputMethod === true || window.minimized === true) {
        return false;
    }

    return true;
}

function isFullyMaximized(window) {
    return geometry.isFullyMaximized(window);
}

function sameValue(a, b) {
    return geometry.sameValue(a, b);
}

function sameGeometry(a, b) {
    return geometry.sameGeometry(a, b);
}

function roundedGeometry(rect) {
    return geometry.roundedGeometry(rect);
}

function ensureTilePadding(window, gap) {
    if (!window.tile) {
        return false;
    }

    if (!sameValue(window.tile.padding, gap)) {
        window.tile.padding = gap;
    }

    return true;
}

function targetGeometryForMaximized(window, gap) {
    var screen = workspace.clientArea(KWin.MaximizeArea, window);

    return geometry.targetGeometryForMaximized(screen, gap);
}

function targetGeometryForFloating(window, gap) {
    var screen = workspace.clientArea(KWin.MaximizeArea, window);
    return geometry.targetGeometryForFloating(window.frameGeometry, screen, gap, knownGapSize);
}

function applyWindowGaps(window, referenceGap) {
    if (!isManagedWindow(window)) {
        return;
    }

    if (updatingWindows.has(window)) {
        return;
    }

    if (window.move === true || window.resize === true) {
        return;
    }

    var gap = readGapSize();
    var currentGeometry = roundedGeometry(window.frameGeometry);
    var targetGeometry = null;
    var previousGap = typeof referenceGap === "number" ? referenceGap : knownGapSize;

    updatingWindows.add(window);

    try {
        if (isFullyMaximized(window)) {
            targetGeometry = targetGeometryForMaximized(window, gap);
        } else if (ensureTilePadding(window, gap)) {
            return;
        } else {
            var screen = workspace.clientArea(KWin.MaximizeArea, window);
            targetGeometry = geometry.targetGeometryForFloating(window.frameGeometry, screen, gap, previousGap);
        }

        if (!targetGeometry) {
            return;
        }

        if (sameGeometry(currentGeometry, targetGeometry)) {
            return;
        }

        window.frameGeometry = targetGeometry;
    } finally {
        updatingWindows.delete(window);
    }
}

function windowList() {
    return typeof workspace.windowList === "function"
        ? workspace.windowList()
        : workspace.stackingOrder;
}

function applyToAllWindows(referenceGap) {
    var windows = windowList();

    for (var i = 0; i < windows.length; ++i) {
        applyWindowGaps(windows[i], referenceGap);
    }
}

function refreshConfiguredGap() {
    var currentGap = readGapSize();

    if (currentGap === knownGapSize) {
        return;
    }

    var previousGap = knownGapSize;
    knownGapSize = currentGap;
    applyToAllWindows(previousGap);
}

function connectWindow(window) {
    if (!window || connectedWindows.has(window)) {
        return;
    }

    connectedWindows.add(window);

    window.frameGeometryChanged.connect(function () {
        applyWindowGaps(window);
    });

    window.maximizedChanged.connect(function () {
        applyWindowGaps(window);
    });

    window.moveResizedChanged.connect(function () {
        if (window.move === false && window.resize === false) {
            applyWindowGaps(window);
        }
    });

    window.tileChanged.connect(function () {
        applyWindowGaps(window);
    });

    applyWindowGaps(window);
}

workspace.windowAdded.connect(function (window) {
    connectWindow(window);
});

workspace.windowRemoved.connect(function (window) {
    updatingWindows.delete(window);
    connectedWindows.delete(window);
});

if (typeof options !== "undefined" && options && options.configChanged) {
    options.configChanged.connect(function () {
        refreshConfiguredGap();
    });
}

var existingWindows = windowList();

for (var i = 0; i < existingWindows.length; ++i) {
    connectWindow(existingWindows[i]);
}
