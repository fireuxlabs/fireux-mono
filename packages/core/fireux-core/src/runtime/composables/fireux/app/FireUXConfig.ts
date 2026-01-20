import { useRuntimeConfig } from '#imports'

export type FireUXRole = 'global' | 'tenant'

export interface FireUXConfig {
  devMode: boolean
  role: FireUXRole

  ecosystem: string
  appId: string
  appName: string
  appShortName: string

  // TODO: make `siteUrl` available via runtime config (final deploy target/domain).
  modules: string[]

  appThumbnail?: string
  appLogo?: string

  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string

  centralSignupUrl?: string
  globalAppId?: string
  developerPin?: string

  // derived
  isTenant: boolean
  isGlobal: boolean
}

type AnyRecord = Record<string, unknown>

const FIREUX_CACHE_KEY = '__FIREUX_CONFIG'

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function reqString(src: AnyRecord, key: string): string {
  const v = src[key]
  if (!isNonEmptyString(v)) {
    throw new Error(
      `[fireux] runtimeConfig.public.fireux.${key} must be a non-empty string.`
    )
  }
  return v.trim()
}

function optString(src: AnyRecord, key: string): string | undefined {
  const v = src[key]
  if (!isNonEmptyString(v)) return undefined
  return v.trim()
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((e) => (typeof e === 'string' ? e.trim() : String(e ?? '').trim()))
    .filter(Boolean)
}

function reqRole(src: AnyRecord): FireUXRole {
  const raw = reqString(src, 'role').toLowerCase()
  if (raw !== 'global' && raw !== 'tenant') {
    throw new Error(
      `[fireux] runtimeConfig.public.fireux.role must be "global" or "tenant".`
    )
  }
  return raw
}

function buildConfig(): Readonly<FireUXConfig> {
  const pub = (useRuntimeConfig().public ?? {}) as AnyRecord
  const fireux = (pub.fireux ?? {}) as AnyRecord

  const devMode = import.meta.dev
  const role = reqRole(fireux)

  const cfg: FireUXConfig = {
    devMode,
    role,

    ecosystem: reqString(fireux, 'ecosystem'),
    appId: reqString(fireux, 'id'),
    appName: reqString(fireux, 'name'),
    appShortName: reqString(fireux, 'shortName'),

    modules: toStringArray(fireux.modules),

    appThumbnail: optString(fireux, 'appThumbnail'),
    appLogo: optString(fireux, 'appLogo'),

    primaryColor: optString(fireux, 'primaryColor'),
    neutralColor: optString(fireux, 'neutralColor'),
    secondaryColor: optString(fireux, 'secondaryColor'),

    centralSignupUrl: optString(fireux, 'centralSignupUrl'),
    globalAppId: optString(fireux, 'globalAppId'),
    developerPin: optString(fireux, 'developerPin'),

    isTenant: role === 'tenant',
    isGlobal: role === 'global',
  }

  return Object.freeze(cfg)
}

/**
 * Central accessor:
 * - On client, reuses a cached config (set by plugin OR computed here)
 * - On server, builds from runtime config
 * - Returns a frozen object with derived flags
 */
export function useFireUXConfig(): Readonly<FireUXConfig> {
  const g = globalThis as any

  // Client cache (fast path)
  if (import.meta.client && g?.[FIREUX_CACHE_KEY]) {
    return g[FIREUX_CACHE_KEY] as Readonly<FireUXConfig>
  }

  const cfg = buildConfig()

  // Populate cache on client so all calls share the same frozen object.
  if (import.meta.client) {
    g[FIREUX_CACHE_KEY] = cfg
  }

  return cfg
}
