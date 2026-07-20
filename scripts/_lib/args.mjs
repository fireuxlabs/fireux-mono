// @fireux-script
// last_used: 2026-07-20
// usage_note: shared CLI parsing, including the directory reconciliation audit.
// Concurrent edit — 2026-07-19 16:53 CEST — Directory Authority Cutover: record reconciliation CLI usage.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: record reconciliation and remediation CLI use.
// FILE: scripts/_lib/args.mjs

/**
 * Tiny CLI arg parser for repo scripts.
 *
 * Supports:
 * - --flag
 * - --key value
 * - --key=value
 *
 * Returns an object of parsed keys -> string|boolean.
 */
export function parseArgs(argv) {
  const args = {}

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token || !token.startsWith('--')) continue

    const [rawKey, rawValue] = token.split('=')
    const key = rawKey.slice(2)
    if (!key) continue

    if (rawValue !== undefined) {
      args[key] = rawValue
      continue
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = next
    i += 1
  }

  return args
}
