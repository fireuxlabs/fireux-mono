import type { FireuxAppConfig } from './types'
import { moduleName } from './modules'
import { APP_PALETTE_KEYS } from '../../types/theme'

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

  if (app.theme) {
    const palette = app.theme.palette
    const keys = Object.keys(palette).sort()
    const expected = [...APP_PALETTE_KEYS].sort()
    if (
      JSON.stringify(keys) !== JSON.stringify(expected) ||
      APP_PALETTE_KEYS.some((key) => !/^#[0-9a-f]{6}$/i.test(palette[key]))
    ) {
      throw new Error(
        '[fireux] app.theme.palette must provide exactly eight 6-digit semantic hex colours.'
      )
    }
    if (app.theme.typography) {
      const { display_family: displayFamily, body_family: bodyFamily } =
        app.theme.typography
      if (
        !String(displayFamily || '').trim() ||
        !String(bodyFamily || '').trim() ||
        String(displayFamily).length > 200 ||
        String(bodyFamily).length > 200
      ) {
        throw new Error(
          '[fireux] app.theme.typography must provide display_family and body_family.'
        )
      }
    }
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
