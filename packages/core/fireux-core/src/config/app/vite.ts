// packages/core/fireux-core/src/config/vite.ts
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NuxtConfig } from '@nuxt/schema'

const resolveDependency = createRequire(import.meta.url).resolve
const FIREBASE_ADMIN_SERVER_SUBPATHS = [
  'firebase-admin/app',
  'firebase-admin/app-check',
  'firebase-admin/auth',
  'firebase-admin/firestore',
  'firebase-admin/storage',
]
const FIREBASE_ADMIN_SERVER_ALIASES = FIREBASE_ADMIN_SERVER_SUBPATHS.map(
  (packageName) => ({
    find: packageName,
    replacement: resolveDependency(packageName),
  })
)

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
  n.vite.optimizeDeps = n.vite.optimizeDeps || {}
  n.vite.optimizeDeps.include = n.vite.optimizeDeps.include || []
  n.vite.resolve = n.vite.resolve || {}
  // Nuxt and linked domain packages must share the App's router instance.
  // Separate copies carry different injection keys and break client navigation.
  n.vite.resolve.dedupe = [
    ...new Set([...(n.vite.resolve.dedupe || []), 'vue', 'vue-router']),
  ]
  n.vite.server = n.vite.server || {}
  n.vite.server.fs = n.vite.server.fs || {}
  n.vite.server.fs.allow = n.vite.server.fs.allow || []

  if (!n.vite.optimizeDeps.include.includes('vuefire')) {
    n.vite.optimizeDeps.include.push('vuefire')
  }

  if (!n.vite.server.fs.allow.includes(workspaceRoot)) {
    n.vite.server.fs.allow.push(workspaceRoot)
  }

  // Firebase Admin's ESM subpath wrappers can expose registered-but-undefined
  // bindings inside Nuxt's Vite dev SSR graph. Point those server-only imports
  // at the package's supported CommonJS entrypoints instead.
  const configuredAliases = Array.isArray(n.vite.resolve.alias)
    ? n.vite.resolve.alias
    : Object.entries(n.vite.resolve.alias || {}).map(([find, replacement]) => ({
        find,
        replacement,
      }))
  const firebaseAdminSubpaths = new Set(FIREBASE_ADMIN_SERVER_SUBPATHS)
  n.vite.resolve.alias = [
    ...FIREBASE_ADMIN_SERVER_ALIASES,
    ...configuredAliases.filter(
      (entry: { find?: string | RegExp }) =>
        typeof entry.find !== 'string' || !firebaseAdminSubpaths.has(entry.find)
    ),
  ]
}
