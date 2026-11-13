import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type { RuntimeApp } from '../../../../config/app/runtime'
import { APP_ROLES, type AppRole } from '../../models/model'
import type {
  FireuxWorkspaceConfig,
  FireuxWorkspaceFamilyConfig,
  FireuxAppSubscriptionCapacity,
  FireuxAppSubscriptionCapacityLimit,
} from '../../../../config/app/types'

export type FireUXConfig = Omit<
  RuntimeApp,
  'id' | 'name' | 'shortName' | 'domain'
> & {
  devMode: boolean
  appId: string
  appName: string
  appShortName: string

  isTenant: boolean
  isGlobal: boolean
  isStandalone: boolean
}

type AnyRecord = Record<string, unknown>

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

function optRoutePath(src: AnyRecord, key: string): `/${string}` | undefined {
  const value = optString(src, key)
  return value?.startsWith('/') && !value.startsWith('//')
    ? (value as `/${string}`)
    : undefined
}

function optRecord(
  src: AnyRecord,
  key: string
): Record<string, unknown> | undefined {
  const v = src[key]
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined
  return v as Record<string, unknown>
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((e) => (typeof e === 'string' ? e.trim() : String(e ?? '').trim()))
    .filter(Boolean)
}

function toWorkspaceConfig(v: unknown): FireuxWorkspaceConfig {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}

  const entries: Array<[string, FireuxWorkspaceFamilyConfig]> = []
  for (const [family, value] of Object.entries(v as AnyRecord)) {
    const key = family.trim().toLowerCase()
    const config =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as AnyRecord)
        : {}
    if (!key) continue

    const normalized: FireuxWorkspaceFamilyConfig = {}
    if (typeof config.origin === 'string') {
      try {
        const origin = new URL(config.origin)
        if (
          ['http:', 'https:'].includes(origin.protocol) &&
          !origin.username &&
          !origin.password
        ) {
          normalized.origin = origin.origin
        }
      } catch {
        // An invalid origin must never become an external destination.
      }
    }
    if (typeof config.canCreate === 'boolean') {
      normalized.canCreate = config.canCreate
    }
    if (typeof config.allowDemo === 'boolean') {
      normalized.allowDemo = config.allowDemo
    }
    if (Object.keys(normalized).length) entries.push([key, normalized])
  }
  return Object.fromEntries(entries)
}

function toSubscriptionCapacity(v: unknown): FireuxAppSubscriptionCapacity {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const entries: Array<[string, FireuxAppSubscriptionCapacityLimit]> = []
  for (const [capability, value] of Object.entries(v as AnyRecord)) {
    const key = capability.trim().toLowerCase()
    if (!key || !value || typeof value !== 'object' || Array.isArray(value))
      continue
    const source = value as AnyRecord
    const limit = (
      tier: 'free' | 'pro' | 'business'
    ): FireuxAppSubscriptionCapacityLimit['free'] => {
      const candidate =
        tier === 'pro' && !Object.hasOwn(source, 'pro')
          ? source.premium
          : source[tier]
      if (candidate === null || candidate === '') return null
      return typeof candidate === 'number' &&
        Number.isInteger(candidate) &&
        candidate >= 0
        ? candidate
        : 0
    }
    entries.push([
      key,
      {
        free: limit('free'),
        pro: limit('pro'),
        business: limit('business'),
      },
    ])
  }
  return Object.fromEntries(entries)
}

function reqRole(src: AnyRecord): AppRole {
  const raw = reqString(src, 'role')
  const role = APP_ROLES.find((candidate) => candidate === raw)
  if (!role) {
    throw new Error(
      `[fireux] runtimeConfig.public.fireux.role must be "global", "tenant", or "standalone".`
    )
  }
  return role
}

/** Validated public App identity, capabilities and policy for this request. */
export function useFireUXConfig(event?: H3Event): Readonly<FireUXConfig> {
  const pub = (useRuntimeConfig(event).public ?? {}) as AnyRecord
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
    projectId: reqString(fireux, 'projectId'),
    ecosystemId: reqString(fireux, 'ecosystemId'),
    appId: reqString(fireux, 'id'),
    appName: reqString(fireux, 'name'),
    appShortName: reqString(fireux, 'shortName'),
    homePath: optRoutePath(fireux, 'homePath') || '/',
    siteUrl: optString(fireux, 'siteUrl'),

    modules: toStringArray(fireux.modules),
    workspaces: toStringArray(fireux.workspaces),
    workspaceConfig: toWorkspaceConfig(fireux.workspaceConfig),
    subscriptionCapacity: toSubscriptionCapacity(fireux.subscriptionCapacity),
    domains: toStringArray(fireux.domains),
    profiles: toStringArray(fireux.profiles),

    contactEmail: optString(fireux, 'contactEmail'),
    designPacks: optRecord(fireux, 'designPacks') as
      | Record<string, Record<string, unknown>>
      | undefined,
    developerId: optString(fireux, 'developerId'),

    isTenant: role === 'tenant',
    isGlobal: role === 'global',
    isStandalone: role === 'standalone',
  }

  return Object.freeze(cfg)
}
