import { useRuntimeConfig } from 'nuxt/app'

type MaybeString = string | undefined

function requireString(value: unknown, key: string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length > 0) return trimmed
  }
  throw new Error(`[fireux] runtimeConfig.public.${key} is required.`)
}

function optionalString(value: unknown): MaybeString {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) =>
      typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()
    )
    .filter((entry) => entry.length > 0)
}

export function useFireUXConfig() {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = (runtimeConfig.public ?? {}) as Record<string, unknown>
  const appSettings = (publicConfig.appSettings ?? {}) as Record<
    string,
    unknown
  >

  const appId = requireString(
    appSettings.appId ?? publicConfig.appId,
    'appSettings.appId'
  )
  const appName = requireString(
    appSettings.appName ?? publicConfig.appName,
    'appSettings.appName'
  )
  const appShortName = requireString(
    appSettings.appShortName ?? publicConfig.appShortName,
    'appSettings.appShortName'
  )
  const ecosystem = requireString(publicConfig.ecosystem, 'ecosystem')

  const rawRole = requireString(publicConfig.role, 'role')
  const normalizedRole = rawRole.toLowerCase()
  if (normalizedRole !== 'global' && normalizedRole !== 'tenant') {
    throw new Error(
      `[fireux] runtimeConfig.public.role must be "global" or "tenant" (received "${rawRole}").`
    )
  }

  const role = normalizedRole === 'global' ? 'global' : 'tenant'
  const modules = toStringArray(publicConfig.modules)
  const devMode = Boolean(publicConfig.devMode)
  const primaryColor = optionalString(publicConfig.primaryColor)
  const neutralColor = optionalString(publicConfig.neutralColor)
  const globalAppId = optionalString(publicConfig.globalAppId)
  const centralSignupUrl = optionalString(publicConfig.centralSignupUrl)
  const appIcon =
    optionalString(appSettings.appIcon) ?? optionalString(publicConfig.appIcon)

  return {
    devMode,
    appId,
    appName,
    appShortName,
    ecosystem,
    modules,
    role,
    primaryColor,
    neutralColor,
    globalAppId,
    centralSignupUrl,
    appIcon,
  }
}
