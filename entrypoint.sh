#!/bin/sh
# Railway volumes mount root-owned: hand the data dir to the node user, then drop privileges.
set -eu
dir=$(dirname "${SQLITE_PATH:-/data/hocuspocus.sqlite}")
mkdir -p "$dir"
[ "$(stat -c %u "$dir")" = 1000 ] || chown -R node:node "$dir"
exec su-exec node node /app/server.js
