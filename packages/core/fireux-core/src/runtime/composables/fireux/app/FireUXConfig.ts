import { useRuntimeConfig } from '#imports'

export type FireUXRole = 'global' | 'tenant' | 'standalone'

export interface FireUXConfig {
  devMode: boolean
  role: FireUXRole

  ecosystem: string
  appId: string
  appName: string
  appShortName: string
  siteUrl?: string
  modules: string[]
  consoles: string[]
  profiles: string[]
  dashboardPages: string[]

  appThumbnail?: string
  appLogo?: string
  appLogoLight?: string
  appLogoDark?: string
  contactEmail?: string
  developerId?: string

  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string

  centralSignupUrl?: string
  globalAppId?: string
  developerPin?: string

  // derived
  isTenant: boolean
  isGlobal: boolean
  isStandalone: boolean
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
  if (raw !== 'global' && raw !== 'tenant' && raw !== 'standalone') {
    throw new Error(
      `[fireux] runtimeConfig.public.fireux.role must be "global", "tenant", or "standalone".`
    )
  }
  return raw
}

function buildConfig(): Readonly<FireUXConfig> {
  const pub = (useRuntimeConfig().public ?? {}) as AnyRecord
  const fireux = (pub.fireux ?? {}) as AnyRecord

  const devMode = import.meta.dev
  const ecosystem = reqString(fireux, 'ecosystem')
  const role = reqRole(fireux)

  if (role === 'standalone' && ecosystem !== 'fireux') {
    throw new Error(
      '[fireux] runtimeConfig.public.fireux.role "standalone" is currently only valid when ecosystem is "fireux".'
    )
  }

  const cfg: FireUXConfig = {
    devMode,
    role,

    ecosystem,
    appId: reqString(fireux, 'id'),
    appName: reqString(fireux, 'name'),
    appShortName: reqString(fireux, 'shortName'),
    siteUrl: optString(fireux, 'siteUrl'),

    modules: toStringArray(fireux.modules),
    consoles: toStringArray(fireux.consoles),
    profiles: toStringArray(fireux.profiles),
    dashboardPages: toStringArray(fireux.dashboardPages),

    appThumbnail: optString(fireux, 'appThumbnail'),
    appLogo: optString(fireux, 'appLogo'),
    appLogoLight: optString(fireux, 'appLogoLight'),
    appLogoDark: optString(fireux, 'appLogoDark'),
    contactEmail: optString(fireux, 'contactEmail'),
    developerId: optString(fireux, 'developerId'),

    primaryColor: optString(fireux, 'primaryColor'),
    neutralColor: optString(fireux, 'neutralColor'),
    secondaryColor: optString(fireux, 'secondaryColor'),

    centralSignupUrl: optString(fireux, 'centralSignupUrl'),
    globalAppId: optString(fireux, 'globalAppId'),
    developerPin: optString(fireux, 'developerPin'),

    isTenant: role === 'tenant',
    isGlobal: role === 'global',
    isStandalone: role === 'standalone',
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

  // Always (re)read runtime config first, then decide whether existing cache is
  // still valid. This avoids stale app/ecosystem values across HMR or context
  // switches during local multi-app development.
  const cfg = buildConfig()

  if (import.meta.client) {
    const cached = g?.[FIREUX_CACHE_KEY] as Readonly<FireUXConfig> | undefined
    const isCacheValid =
      !!cached &&
      cached.appId === cfg.appId &&
      cached.ecosystem === cfg.ecosystem &&
      cached.role === cfg.role

    if (isCacheValid) return cached

    g[FIREUX_CACHE_KEY] = cfg
  }

  return cfg
}
