import type { FireuxAppConfig } from './types'
import { moduleName } from './modules'

export function validateFireuxAppConfig(app: FireuxAppConfig): void {
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
