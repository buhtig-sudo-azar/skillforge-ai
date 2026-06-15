#!/bin/bash
ulimit -n 65536
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting Next.js server..." >> /tmp/start.log
  npx next start -p 3000 -H 127.0.0.1 2>&1 >> /tmp/start.log
  EXIT=$?
  echo "[$(date)] Server exited with code $EXIT" >> /tmp/start.log
  sleep 2
done
