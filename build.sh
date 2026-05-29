#!/bin/bash
cd "$HOME/.openclaw-autoclaw/agents/zechy-computer/workspace/corenty-v2"
node node_modules/vite/bin/vite.js build 2>&1
echo "EXIT_CODE=$?"
