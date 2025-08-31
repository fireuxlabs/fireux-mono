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

  // Ensure we always have an object to read, with reasonable defaults
  const appSettings = (runtimeConfig.public?.appSettings || {
    projectName: runtimeConfig.public?.ecosystem || 'FireUX',
    appName: 'FireUX',
    appId: 'fireux-app',
    nodeEnv: process.env.NODE_ENV || 'development',
    appShortName: 'FireUX',
    appPrimaryColor: '#111827',
    appNeutralColor: '#9CA3AF',
    appIcon: '/icon.png',
    domain: 'localhost',
  }) as AppSettings

  const devMode = runtimeConfig.public?.devMode ?? true
  const ecosystem = runtimeConfig.public?.ecosystem
  const modules = runtimeConfig.public?.modules || []

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
