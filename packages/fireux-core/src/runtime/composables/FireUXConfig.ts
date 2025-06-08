import { useRuntimeConfig } from 'nuxt/app'

interface AppSettings {
  projectName: string // Moved to the top to match `.env` order
  appName: string
  appId: string
  nodeEnv: string
  // domain: string
  // pin: string
  // appShortName: string
  // appThemeColor: string
  // appBackgroundColor: string
  // appIcon: string
}

export function useFireUXConfig() {
  const runtimeConfig = useRuntimeConfig()
  const appSettings = runtimeConfig.public.appSettings as AppSettings

  const devMode = appSettings.nodeEnv === 'development'

  const { projectName, appName, appId } = appSettings // Reordered destructuring to match `.env` order

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
  }
}
