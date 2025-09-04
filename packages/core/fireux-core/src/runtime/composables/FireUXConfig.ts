import { useRuntimeConfig } from 'nuxt/app'

interface AppSettings {
  projectName: string // Moved to the top to match `.env` order
  appName: string
  appId: string
  nodeEnv: string
  appShortName: string
  appPrimaryColor: string
  appNeutralColor: string
  appIcon: string
  domain: string
}

export function useFireUXConfig() {
  const runtimeConfig = useRuntimeConfig()

  // Ensure we always have an object to read, with reasonable defaults.
  // Deep-merge: runtime appSettings may be partial (core exposes minimal fields),
  // so we merge it over sensible defaults to avoid validation errors.
  const defaultSettings: AppSettings = {
    projectName: (runtimeConfig.public?.ecosystem as string) || 'FireUX',
    appName: 'FireUX',
    appId: 'fireux-app',
    nodeEnv: process.env.NODE_ENV || 'development',
    appShortName: 'FireUX',
    appPrimaryColor: '#111827',
    appNeutralColor: '#9CA3AF',
    appIcon: '/icon.png',
    domain: 'localhost',
  }
  const runtimeAppSettings =
    (runtimeConfig.public?.appSettings as Partial<AppSettings>) || {}
  const appSettings = {
    ...defaultSettings,
    ...runtimeAppSettings,
  } as AppSettings

  const devMode = runtimeConfig.public?.devMode ?? true
  const ecosystem =
    typeof runtimeConfig.public?.ecosystem === 'string'
      ? runtimeConfig.public.ecosystem
      : undefined
  // Ensure modules is always a string array for safe downstream usage
  const modulesRaw = runtimeConfig.public?.modules
  const modules: string[] = Array.isArray(modulesRaw)
    ? modulesRaw.map((m) => String(m))
    : []

  const { projectName, appName, appId, appIcon } = appSettings

  if (!projectName || typeof projectName !== 'string') {
    throw new Error('❌ Project Name must be a valid string.')
  }

  if (!appName || typeof appName !== 'string') {
    throw new Error('❌ App Name must be a valid string.')
  }

  if (!appId || typeof appId !== 'string') {
    throw new Error('❌ App ID must be a valid string.')
  }

  return {
    devMode,
    projectName, // Reordered return values to match `.env` order
    appName,
    appId,
    appIcon, // Added appIcon to return values
    ecosystem,
    modules,
  }
}
