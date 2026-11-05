import { fileURLToPath } from 'node:url'
import { defineFireuxApp, type FireuxAppConfig } from 'fireux-app/config'

export type { FireuxAppConfig } from 'fireux-app/config'

export function defineFireuxEcosystem(app: FireuxAppConfig) {
  if (app.role !== 'global') {
    throw new Error('[fireux-ecosystem] Main Apps require role "global".')
  }
  const layers =
    typeof app.extends === 'string' ? [app.extends] : app.extends || []
  return defineFireuxApp({
    ...app,
    extends: [
      ...layers,
      fileURLToPath(new URL('../src/runtime/nuxt.config.ts', import.meta.url)),
    ] as FireuxAppConfig['extends'],
  })
}
