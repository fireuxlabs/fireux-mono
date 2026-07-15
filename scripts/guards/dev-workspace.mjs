// @fireux-script
// last_used: 2026-07-15
// usage_note: checks generated developer command surfaces without mutating them.
// FILE: scripts/guards/dev-workspace.mjs

import { syncDevWorkspace } from '../sync-dev-workspace.mjs'

export async function run() {
  await syncDevWorkspace({ check: true, silent: true })
  console.log('[guard] ✅ developer workspace files are in sync')
}
