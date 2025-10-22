import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const pub = (useRuntimeConfig().public ?? {}) as Record<string, unknown>
  const asString = (value: unknown): string =>
    typeof value === 'string' ? value : ''

  const cfg = Object.freeze({
    devMode: Boolean(pub.devMode),
    role: asString(pub.role).toLowerCase(),
    ecosystem: asString(pub.ecosystem),
    appId: asString(pub.appId),
    appName: asString(pub.appName),
    appShortName: asString(pub.appShortName),
    modules: Array.isArray(pub.modules) ? pub.modules : [],
    appIcon: typeof pub.appIcon === 'string' ? pub.appIcon : undefined,
    primaryColor:
      typeof pub.primaryColor === 'string' ? pub.primaryColor : undefined,
    neutralColor:
      typeof pub.neutralColor === 'string' ? pub.neutralColor : undefined,
    centralSignupUrl:
      typeof pub.centralSignupUrl === 'string'
        ? pub.centralSignupUrl
        : undefined,
    globalAppId:
      typeof pub.globalAppId === 'string' ? pub.globalAppId : undefined,
  })

  return {
    provide: {
      fireuxConfig: cfg,
    },
  }
})
