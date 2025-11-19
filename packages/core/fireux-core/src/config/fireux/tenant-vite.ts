import type { NuxtConfig } from 'nuxt/schema'
import { resolveWorkspaceRoot } from './env'

export function resolveTenantVite(
  devMode: boolean
): NuxtConfig['vite'] | undefined {
  if (!devMode) return undefined

  return { server: { fs: { allow: [resolveWorkspaceRoot()] } } }
}
