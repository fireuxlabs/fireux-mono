import { resolve as pathResolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const env = (key) => (process.env[key]?.trim() || undefined)

export const requireEnv = (key) => {
  const value = env(key)
  if (!value) {
    throw new Error(`[fireux] Environment variable ${key} is required.`)
  }
  return value
}

export function resolveWorkspaceRoot() {
  const explicit = env('FIREUX_WORKSPACE_ROOT')
  if (explicit) {
    return pathResolve(explicit)
  }

  let current = dirname(fileURLToPath(import.meta.url))

  for (let i = 0; i < 10; i += 1) {
    const hasWorkspace = existsSync(pathResolve(current, 'pnpm-workspace.yaml'))
    const hasGit = existsSync(pathResolve(current, '.git'))
    if (hasWorkspace || hasGit) {
      return current
    }

    const parent = pathResolve(current, '..')
    if (parent === current) break
    current = parent
  }

  return current
}
