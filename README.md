# Window Gaps

`Window Gaps` is a KWin Script for KDE Plasma 6 that adds configurable gaps around windows on Wayland.

## Features

- Adds gaps between tiled windows through KWin tile padding.
- Adds gaps between windows and screen edges.
- Leaves fullscreen windows untouched.
- Applies gaps to maximized windows on all sides.
- Exposes a configurable `gapSize` option in `System Settings > Window Management > KWin Scripts`.
- Avoids geometry update loops by tracking windows currently being modified.
- Avoids interfering with interactive move and resize operations.

## Requirements

- KDE Plasma 6
- KWin on Wayland
- `kpackagetool6`
- `kwriteconfig6`
- `qdbus6`

## Project Structure

```text
.
├── contents/
│   ├── code/
│   │   ├── geometry.js
│   │   └── main.js
│   ├── config/
│   │   └── main.xml
│   └── ui/
│       └── config.ui
├── install.sh
├── uninstall.sh
├── metadata.json
├── package.json
└── tests/
```

## Installation

```bash
cd /home/master/code/plasma-window-gaps
./install.sh
```

This will:

- install or upgrade the KWin Script package,
- enable the plugin in `kwinrc`,
- trigger `KWin` reconfiguration.

## Configuration

Open:

`System Settings > Window Management > KWin Scripts > Window Gaps`

Then change:

- `Gap size (px)`

The setting is stored in:

- `~/.config/kwinrc`
- group: `[Script-plasma-window-gaps]`
- key: `gapSize`

You can also change it from the terminal:

```bash
kwriteconfig6 --file kwinrc --group Script-plasma-window-gaps --key gapSize 24
qdbus6 org.kde.KWin /KWin org.kde.KWin.reconfigure
```

## Testing

Run the local unit tests:

```bash
cd /home/master/code/plasma-window-gaps
npm test
```

The test suite checks:

- gap value clamping,
- maximized window geometry calculations,
- floating window edge offset logic,
- runtime loading of `main.js` in a mocked KWin-like environment.

## Manual Verification

1. Open two windows and quick-tile them side by side.
2. Confirm there is a visible gap between them and the screen edges.
3. Maximize a window and confirm the gap is applied on all sides.
4. Put a window into fullscreen and confirm there are no gaps.
5. Change `Gap size (px)` in System Settings and click `Apply`.

## Reinstall / Upgrade

```bash
cd /home/master/code/plasma-window-gaps
./install.sh
```

## Uninstall

```bash
cd /home/master/code/plasma-window-gaps
./uninstall.sh
```

## Notes

- This script targets Wayland.
- Fullscreen windows are always excluded.
- If you use other window gap scripts at the same time, they may conflict with this one.
- If configuration changes do not appear to apply, run:

```bash
qdbus6 org.kde.KWin /KWin org.kde.KWin.reconfigure
```
