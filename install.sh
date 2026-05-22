#!/usr/bin/env bash
set -e

kpackagetool6 --type=KWin/Script --install . || kpackagetool6 --type=KWin/Script --upgrade .
kwriteconfig6 --file kwinrc --group Plugins --key plasma-window-gapsEnabled true
qdbus-qt6 org.kde.KWin /KWin reconfigure
