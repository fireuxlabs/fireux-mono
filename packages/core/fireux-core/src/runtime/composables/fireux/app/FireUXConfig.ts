import { useRuntimeConfig } from '#imports'

export type FireUXRole = 'global' | 'tenant' | 'standalone'

export type FireUXConsoleConfig = Record<
  string,
  {
    canCreate?: boolean
    targetIds?: string[]
  }
>

export interface FireUXConfig {
  devMode: boolean
  role: FireUXRole

  ecosystem: string
  appId: string
  appName: string
  appShortName: string
  siteUrl?: string
  membership: 'open' | 'restricted'
  modules: string[]
  consoles: string[]
  consoleConfig: FireUXConsoleConfig
  domains: string[]
  profiles: string[]
  navHiddenKeys: string[]

  appThumbnail?: string
  appLogo?: string
  appLogoLight?: string
  appLogoDark?: string
  contactEmail?: string
  designPack?: Record<string, unknown>
  designPacks?: Record<string, Record<string, unknown>>
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
  isMembershipRestricted: boolean
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

function optRecord(src: AnyRecord, key: string): Record<string, unknown> | undefined {
  const v = src[key]
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined
  return v as Record<string, unknown>
}

function consoleConfig(src: AnyRecord): FireUXConsoleConfig {
  const raw = optRecord(src, 'consoleConfig')
  if (!raw) return {}

  return Object.fromEntries(
    Object.entries(raw)
      .map(([key, value]) => {
        if (!key.trim() || !value || typeof value !== 'object' || Array.isArray(value)) {
          return null
        }

        const cfg = value as Record<string, unknown>
        const targetIds = Array.isArray(cfg.targetIds)
          ? cfg.targetIds
              .map((targetId) => String(targetId ?? '').trim())
              .filter(Boolean)
          : []

        return [
          key.trim().toLowerCase(),
          {
            ...(typeof cfg.canCreate === 'boolean'
              ? { canCreate: cfg.canCreate }
              : {}),
            ...(targetIds.length ? { targetIds } : {}),
          },
        ] as const
      })
      .filter(
        (
          entry
        ): entry is readonly [
          string,
          { canCreate?: boolean; targetIds?: string[] },
        ] => Boolean(entry)
      )
  )
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
    membership:
      optString(fireux, 'membership') === 'open'
        ? 'open'
        : optString(fireux, 'membership') === 'restricted'
          ? 'restricted'
          : role === 'tenant'
            ? 'restricted'
            : 'open',

    modules: toStringArray(fireux.modules),
    consoles: toStringArray(fireux.consoles),
    consoleConfig: consoleConfig(fireux),
    domains: toStringArray(fireux.domains),
    profiles: toStringArray(fireux.profiles),
    navHiddenKeys: toStringArray(fireux.navHiddenKeys),

    appThumbnail: optString(fireux, 'appThumbnail'),
    appLogo: optString(fireux, 'appLogo'),
    appLogoLight: optString(fireux, 'appLogoLight'),
    appLogoDark: optString(fireux, 'appLogoDark'),
    contactEmail: optString(fireux, 'contactEmail'),
    designPack: optRecord(fireux, 'designPack'),
    designPacks: optRecord(fireux, 'designPacks') as
      | Record<string, Record<string, unknown>>
      | undefined,
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
    isMembershipRestricted:
      optString(fireux, 'membership') === 'restricted' ||
      (!optString(fireux, 'membership') && role === 'tenant'),
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
