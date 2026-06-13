import type { FireuxAppConfig } from './types'

export function validateFireuxAppConfig(app: FireuxAppConfig): void {
  if (app.role === 'standalone' && app.ecosystem !== 'fireux') {
    throw new Error(
      '[fireux] role "standalone" is currently only supported inside the "fireux" ecosystem.'
    )
  }

  if (
    app.membership &&
    app.membership !== 'open' &&
    app.membership !== 'restricted'
  ) {
    throw new Error('[fireux] membership must be "open" or "restricted".')
  }
}
