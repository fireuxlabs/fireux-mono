// @fireux-script
// last_used: 2026-07-15
// usage_note: baseline after scripts cleanup; update when run.
import { execSync } from 'node:child_process'

function usage() {
  console.error('Usage: node scripts/free-port.mjs <port>')
}

const rawPort = process.argv[2]
const port = Number(rawPort)
if (!rawPort || !Number.isInteger(port) || port <= 0) {
  usage()
  process.exit(2)
}

// Best-effort, macOS/Linux.
// If anything fails, we do NOT crash the dev script.
try {
  const cmd = `lsof -ti tcp:${port} -sTCP:LISTEN`
  const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim()

  if (!out) process.exit(0)

  const pids = out
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGTERM')
    } catch {
      // ignore
    }
  }

  // Give processes a moment to exit.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300)

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 0)
      process.kill(Number(pid), 'SIGKILL')
    } catch {
      // already gone
    }
  }
} catch {
  // lsof not available or no perms; ignore.
}
