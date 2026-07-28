import type { FireuxAppConfig } from './types'
import { moduleName } from './modules'
import { validateAppDesignPack } from './design-packs'

export function validateFireuxAppConfig(app: FireuxAppConfig): void {
  validateAppDesignPack(app.designPack)

  if (!String(app.projectId || '').trim()) {
    throw new Error('[fireux] app.projectId must name the canonical FireUX Project entity.')
  }

  if ('ecosystemId' in app && !String(app.ecosystemId || '').trim()) {
    throw new Error('[fireux] app.ecosystemId must be omitted or name a canonical Ecosystem entity.')
  }

  if (app.role === 'standalone' && app.ecosystem !== 'fireux') {
    throw new Error(
      '[fireux] role "standalone" is currently only supported inside the "fireux" ecosystem.'
    )
  }

  if (
    app.authDefaultMode &&
    app.authDefaultMode !== 'sign-in' &&
    app.authDefaultMode !== 'sign-up'
  ) {
    throw new Error(
      '[fireux] app.authDefaultMode must be "sign-in" or "sign-up".'
    )
  }

  const ecosystemModule = `fireux-${app.ecosystem}`
  if (app.modules?.some((entry) => moduleName(entry) === ecosystemModule)) {
    throw new Error(
      `[fireux] Do not add "${ecosystemModule}" to app.modules; the ecosystem module is loaded automatically from app.ecosystem.`
    )
  }
}
