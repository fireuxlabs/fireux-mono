// packages/core/fireux-core/src/config/vite.ts
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NuxtConfig } from 'nuxt/schema'

export function configViteWorkspace(nuxt: NuxtConfig) {
  const currentDir = dirname(fileURLToPath(import.meta.url))

  let cursor = currentDir
  let workspaceRoot = currentDir

  for (let i = 0; i < 10; i += 1) {
    if (
      existsSync(resolve(cursor, 'pnpm-workspace.yaml')) ||
      existsSync(resolve(cursor, '.git'))
    ) {
      workspaceRoot = cursor
      break
    }
    const parent = resolve(cursor, '..')
    if (parent === cursor) break
    cursor = parent
  }

  // NuxtConfig typing doesn't fully narrow nested Vite config objects,
  // so we write via a local mutable "any" view to avoid TS18048 noise.
  const n = nuxt as NuxtConfig & { vite?: any }

  n.vite = n.vite || {}
  n.vite.server = n.vite.server || {}
  n.vite.server.fs = n.vite.server.fs || {}
  n.vite.server.fs.allow = n.vite.server.fs.allow || []

  if (!n.vite.server.fs.allow.includes(workspaceRoot)) {
    n.vite.server.fs.allow.push(workspaceRoot)
  }
}
