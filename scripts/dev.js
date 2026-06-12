#!/usr/bin/env node
// Clears ELECTRON_RUN_AS_NODE so electron-vite spawns a real Electron process
delete process.env.ELECTRON_RUN_AS_NODE

const { spawn } = require('child_process')

const child = spawn('electron-vite', ['dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
})
child.on('close', (code) => process.exit(code ?? 0))
