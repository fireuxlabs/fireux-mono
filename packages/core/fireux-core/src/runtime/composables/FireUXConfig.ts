// FILE: packages/core/fireux-core/src/runtime/composables/FireUXConfig.ts
import { useRuntimeConfig } from '#imports'
import { getApps } from 'firebase/app'

export type FireUXRole = 'global' | 'tenant'

export interface FireUXConfig {
  devMode: boolean
  role: FireUXRole
  ecosystem: string
  appId: string
  appName: string
  appShortName: string
  modules: string[]
  appIcon?: string
  primaryColor?: string
  neutralColor?: string
  centralSignupUrl?: string
  globalAppId?: string
  developerPin?: string
  // derived
  isTenant: boolean
  isGlobal: boolean
}

const FIREUX_CACHE_KEY = '__FIREUX_CONFIG'

function reqString(src: Record<string, unknown>, key: string): string {
  const v = src[key]
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(
      `[fireux] runtimeConfig.public.${key} must be a non-empty string.`
    )
  }
  return v.trim()
}
function reqStringWithFallback(
  src: Record<string, unknown>,
  key: string,
  fallbackObj?: Record<string, unknown>,
  fallbackKey?: string
): string {
  const v = src[key]
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (fallbackObj && fallbackKey) {
    const f = fallbackObj[fallbackKey]
    if (typeof f === 'string' && f.trim()) return f.trim()
  }
  throw new Error(
    `[fireux] runtimeConfig.public.${key} must be a non-empty string.`
  )
}
function optString(
  src: Record<string, unknown>,
  key: string
): string | undefined {
  const v = src[key]
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t || undefined
}
function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((e) => (typeof e === 'string' ? e.trim() : String(e ?? '').trim()))
    .filter(Boolean)
}

/**
 * Central accessor:
 * - On client, reuses window.__FIREUX_CONFIG set by the plugin
 * - On server (or if plugin didn’t run), builds from runtime config
 * - Returns a frozen object with derived flags
 */
export function useFireUXConfig(): Readonly<FireUXConfig> {
  const g = globalThis as Record<string, unknown>
  const isBrowser = globalThis.window !== undefined

  if (!getApps().length) {
    throw new Error(
      'Firebase must be initialized before calling useFireUXConfig().'
    )
  }

  // prefer plugin-provided cache on client
  if (isBrowser && g[FIREUX_CACHE_KEY]) {
    return g[FIREUX_CACHE_KEY] as Readonly<FireUXConfig>
  }

  // SSR or fallback: build from runtimeConfig
  const pub = (useRuntimeConfig().public ?? {}) as Record<string, unknown>
  const appSettings = (pub.appSettings ?? {}) as Record<string, unknown>

  const devMode = Boolean(pub.devMode)
  const rawRole = reqString(pub, 'role').toLowerCase()
  if (rawRole !== 'global' && rawRole !== 'tenant') {
    throw new Error(
      `[fireux] runtimeConfig.public.role must be "global" or "tenant".`
    )
  }
  const role = rawRole as FireUXRole

  const cfg: Readonly<FireUXConfig> = Object.freeze({
    devMode,
    role,
    ecosystem: reqString(pub, 'ecosystem'),
    appId: reqStringWithFallback(pub, 'appId', appSettings, 'appId'),
    appName: reqStringWithFallback(pub, 'appName', appSettings, 'appName'),
    appShortName: reqStringWithFallback(
      pub,
      'appShortName',
      appSettings,
      'appShortName'
    ),
    modules: toStringArray(pub.modules),
    appIcon: optString(pub, 'appIcon'),
    primaryColor: optString(pub, 'primaryColor'),
    neutralColor: optString(pub, 'neutralColor'),
    centralSignupUrl: optString(pub, 'centralSignupUrl'),
    globalAppId: optString(pub, 'globalAppId'),
    developerPin: optString(pub, 'developerPin'),
    isTenant: role === 'tenant',
    isGlobal: role === 'global',
  })

  // seed cache client-side if needed
  if (isBrowser) {
    g[FIREUX_CACHE_KEY] = cfg
  }

  return cfg
}

/** Guarded helper for code that REQUIRES tenant scope */
export function requireTenantAppId(): string {
  const { isTenant, appId } = useFireUXConfig()
  if (!isTenant) {
    throw new Error(
      '[fireux] requireTenantAppId() called outside tenant scope.'
    )
  }
  return appId
}
