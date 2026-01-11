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
