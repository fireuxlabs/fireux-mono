// @fireux-script
// last_used: 2026-07-08
// usage_note: shared helper for scripts that must invoke the repo-pinned pnpm.

import { spawn, spawnSync } from 'node:child_process'

export function spawnPnpm(args, options = {}) {
  return spawn('corepack', ['pnpm', ...args], options)
}

export function spawnSyncPnpm(args, options = {}) {
  return spawnSync('corepack', ['pnpm', ...args], options)
}
