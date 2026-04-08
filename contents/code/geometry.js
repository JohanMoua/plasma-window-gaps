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

function targetGeometryForFloating(frameGeometry, screen, gap, referenceGap) {
    var geometry = roundedGeometry(frameGeometry);
    var anchorGap = typeof referenceGap === "number" ? referenceGap : gap;
    var touchesLeft = sameValue(geometry.x, screen.x) || sameValue(geometry.x, screen.x + anchorGap);
    var touchesTop = sameValue(geometry.y, screen.y) || sameValue(geometry.y, screen.y + anchorGap);
    var touchesRight = sameValue(geometry.x + geometry.width, screen.x + screen.width)
        || sameValue(geometry.x, screen.x + screen.width - geometry.width - anchorGap);
    var touchesBottom = sameValue(geometry.y + geometry.height, screen.y + screen.height)
        || sameValue(geometry.y, screen.y + screen.height - geometry.height - anchorGap);
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

var geometryApi = {
    sameValue: sameValue,
    sameGeometry: sameGeometry,
    roundedGeometry: roundedGeometry,
    clampGap: clampGap,
    isFullyMaximized: isFullyMaximized,
    targetGeometryForMaximized: targetGeometryForMaximized,
    targetGeometryForFloating: targetGeometryForFloating
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = geometryApi;
}
