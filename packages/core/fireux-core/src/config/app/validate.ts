import type { FireuxAppConfig } from './types'
import { moduleName } from './modules'

export function validateFireuxAppConfig(app: FireuxAppConfig): void {
  if (
    app.context !== undefined &&
    (typeof app.context !== 'string' || app.context.length > 32000)
  )
    throw new Error(
      '[fireux] app.context must be text up to 32,000 characters.'
    )

  if (
    app.homePath &&
    (!app.homePath.startsWith('/') || app.homePath.startsWith('//'))
  ) {
    throw new Error(
      '[fireux] app.homePath must be an absolute same-origin route beginning with one slash.'
    )
  }

  if (!String(app.projectId || '').trim()) {
    throw new Error(
      '[fireux] app.projectId must name the canonical FireUX Project entity.'
    )
  }

  if (!String(app.ecosystemId || '').trim()) {
    throw new Error(
      '[fireux] app.ecosystemId must name the canonical Ecosystem entity that contains this App.'
    )
  }

  if (app.role === 'standalone' && app.ecosystem !== 'fireux') {
    throw new Error(
      '[fireux] role "standalone" is currently only supported inside the "fireux" ecosystem.'
    )
  }

  const ecosystemModule = `fireux-${app.ecosystem}`
  if (app.modules?.some((entry) => moduleName(entry) === ecosystemModule)) {
    throw new Error(
      `[fireux] Do not add "${ecosystemModule}" to app.modules; the ecosystem module is loaded automatically from app.ecosystem.`
    )
  }
}
