import { useRuntimeConfig } from '#imports'

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
  secondaryColor?: string
  centralSignupUrl?: string
  globalAppId?: string
  developerPin?: string
  // derived
  isTenant: boolean
  isGlobal: boolean
}

function reqString(src: Record<string, unknown>, key: string): string {
  const v = src[key]
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(
      `[fireux] runtimeConfig.public.fireux.${key} must be a non-empty string.`
    )
  }
  return v.trim()
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
  const pub = (useRuntimeConfig().public ?? {}) as Record<string, unknown>
  const fireux = (pub.fireux ?? {}) as Record<string, unknown>

  const devMode = import.meta.dev
  const rawRole = reqString(fireux, 'role').toLowerCase()
  if (rawRole !== 'global' && rawRole !== 'tenant') {
    throw new Error(
      `[fireux] runtimeConfig.public.fireux.role must be "global" or "tenant".`
    )
  }
  const role = rawRole as FireUXRole

  const cfg: Readonly<FireUXConfig> = Object.freeze({
    devMode,
    role,
    ecosystem: reqString(fireux, 'ecosystem'),
    appId: reqString(fireux, 'id'),
    appName: reqString(fireux, 'name'),
    appShortName: reqString(fireux, 'shortName'),
    modules: toStringArray(fireux.modules),
    appIcon: optString(fireux, 'appIcon'),
    primaryColor: optString(fireux, 'primaryColor'),
    neutralColor: optString(fireux, 'neutralColor'),
    secondaryColor: optString(fireux, 'secondaryColor'),
    centralSignupUrl: optString(fireux, 'centralSignupUrl'),
    globalAppId: optString(fireux, 'globalAppId'),
    developerPin: optString(fireux, 'developerPin'),
    isTenant: role === 'tenant',
    isGlobal: role === 'global',
  })

  return cfg
}
