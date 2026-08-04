import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type { RuntimeApp } from '../../../../config/app/runtime'
import type {
  FireuxAppRole,
  FireuxConsoleConfig,
} from '../../../../config/app/types'

export type FireUXRole = FireuxAppRole

export type FireUXConfig = Omit<
  RuntimeApp,
  'id' | 'name' | 'shortName' | 'domain'
> & {
  devMode: boolean
  appId: string
  appName: string
  appShortName: string

  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string

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

function toConsoleConfig(v: unknown): FireuxConsoleConfig {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}

  return Object.fromEntries(
    Object.entries(v as AnyRecord)
      .map(([family, value]) => {
        const key = family.trim().toLowerCase()
        const config =
          value && typeof value === 'object' && !Array.isArray(value)
            ? (value as AnyRecord)
            : {}
        if (!key || typeof config.canCreate !== 'boolean') return null
        return [key, { canCreate: config.canCreate }] as const
      })
      .filter(
        (entry): entry is readonly [string, { canCreate: boolean }] =>
          entry !== null
      )
  )
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

function buildConfig(event?: H3Event): Readonly<FireUXConfig> {
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
    ecosystemId: optString(fireux, 'ecosystemId'),
    appId: reqString(fireux, 'id'),
    appName: reqString(fireux, 'name'),
    appShortName: reqString(fireux, 'shortName'),
    siteUrl: optString(fireux, 'siteUrl'),

    modules: toStringArray(fireux.modules),
    consoles: toStringArray(fireux.consoles),
    consoleConfig: toConsoleConfig(fireux.consoleConfig),
    domains: toStringArray(fireux.domains),
    profiles: toStringArray(fireux.profiles),
    selfJoinEnabled: fireux.selfJoinEnabled === true,
    authDefaultMode:
      fireux.authDefaultMode === 'sign-in' ||
      fireux.authDefaultMode === 'sign-up'
        ? fireux.authDefaultMode
        : undefined,
    authCompletion: optRecord(fireux, 'authCompletion') as
      | FireUXConfig['authCompletion']
      | undefined,
    authOnboarding: optRecord(fireux, 'authOnboarding') as
      | FireUXConfig['authOnboarding']
      | undefined,
    navHiddenKeys: toStringArray(fireux.navHiddenKeys),
    navOverrides: (optRecord(fireux, 'navOverrides') ||
      {}) as FireUXConfig['navOverrides'],

    contactEmail: optString(fireux, 'contactEmail'),
    pricing: optRecord(fireux, 'pricing') as FireUXConfig['pricing'],
    designPack: optRecord(fireux, 'designPack') as FireUXConfig['designPack'],
    designPacks: optRecord(fireux, 'designPacks') as
      | Record<string, Record<string, unknown>>
      | undefined,
    developerId: optString(fireux, 'developerId'),

    primaryColor: optString(fireux, 'primaryColor'),
    neutralColor: optString(fireux, 'neutralColor'),
    secondaryColor: optString(fireux, 'secondaryColor'),

    isTenant: role === 'tenant',
    isGlobal: role === 'global',
    isStandalone: role === 'standalone',
  }

  return Object.freeze(cfg)
}

export function useFireUXConfig(event?: H3Event): Readonly<FireUXConfig> {
  return buildConfig(event)
}
