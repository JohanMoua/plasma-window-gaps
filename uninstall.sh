#!/usr/bin/env bash
set -e

kwriteconfig6 --file kwinrc --group Plugins --key plasma-window-gapsEnabled false
kpackagetool6 --type=KWin/Script --remove plasma-window-gaps
qdbus-qt6 org.kde.KWin /KWin reconfigure
