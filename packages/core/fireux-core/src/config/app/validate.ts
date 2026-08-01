import type { FireuxAppConfig } from './types'
import { moduleName } from './modules'
import { validateAppDesignPack } from './design-packs'

export function validateFireuxAppConfig(app: FireuxAppConfig): void {
  validateAppDesignPack(app.designPack)

  if (!app.brand || !['core', 'ecosystem', 'app'].includes(app.brand.owner)) {
    throw new Error(
      '[fireux] app.brand must declare exactly one owner: "core", "ecosystem", or "app".'
    )
  }
  if (
    app.brand.owner === 'app' &&
    app.brand.status !== 'approved' &&
    app.brand.status !== 'provisional'
  ) {
    throw new Error(
      '[fireux] an App-owned brand must declare status "approved" or "provisional".'
    )
  }

  if (!String(app.projectId || '').trim()) {
    throw new Error('[fireux] app.projectId must name the canonical FireUX Project entity.')
  }

  if ('ecosystemId' in app && !String(app.ecosystemId || '').trim()) {
    throw new Error('[fireux] app.ecosystemId must be omitted or name a canonical Ecosystem entity.')
  }

  if (
    app.serverFunctionServiceAccount &&
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]@[a-z][a-z0-9-]{4,28}[a-z0-9]\.iam\.gserviceaccount\.com$/i.test(
      app.serverFunctionServiceAccount
    )
  ) {
    throw new Error(
      '[fireux] app.serverFunctionServiceAccount must be an exact Google service-account email.'
    )
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
