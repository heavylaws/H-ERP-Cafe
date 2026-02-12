#!/bin/bash
cd /home/cashier/.gemini/antigravity/scratch/printer-agent
while true; do
  echo "[$(date)] Starting Printer Agent..." >> agent.log
  npx tsx agent.ts >> agent.log 2>&1
  echo "[$(date)] Printer Agent crashed! Restarting in 5 seconds..." >> agent.log
  sleep 5
done

