import { useRuntimeConfig } from 'nuxt/app'

export function useFireUXConfig() {
  const config = useRuntimeConfig().public

  const devMode = config.nodeEnv === 'development'

  const tenantId = config.tenantId
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('❌ Tenant ID must be a valid string.')
  }

  const appName = config.appName
  if (!appName || typeof appName !== 'string') {
    throw new Error('❌ App Name must be a valid string.')
  }

  return {
    devMode,
    tenantId,
    appName,
  }
}
