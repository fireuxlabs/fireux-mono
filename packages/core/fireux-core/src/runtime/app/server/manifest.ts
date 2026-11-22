import { useAppConfig, useRuntimeConfig } from '#imports'
import { GLOBAL_BRAND_ASSETS as brandAssets } from '../../../utils/brandAssets'
import { resolveAppTheme } from '../utils/app-theme'
import { withBuildVersion } from '../utils/build-version-url'

const DEFAULT_BACKGROUND = '#ffffff'
const DEFAULT_THEME = '#0f172a'
const MANIFEST_ORIGIN = 'https://fireux.local'

export function readManifestStartUrl(value: unknown): string {
  const candidate = Array.isArray(value) ? value[0] : value
  if (typeof candidate !== 'string') return '/'

  const requestedPath = candidate.trim()
  if (!requestedPath.startsWith('/') || requestedPath.startsWith('//'))
    return '/'

  try {
    const url = new URL(requestedPath, MANIFEST_ORIGIN)
    if (url.origin !== MANIFEST_ORIGIN) return '/'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

export function buildAppManifest(startUrl: string, nameSuffix = '') {
  const runtimeConfig = useRuntimeConfig()
  const pub = runtimeConfig.public || {}
  const fireux = (pub.fireux || {}) as Record<string, unknown>
  const name =
    (typeof fireux.name === 'string' && fireux.name.trim()) ||
    (typeof pub.appName === 'string' && pub.appName.trim()) ||
    'FireUX'
  const shortName =
    (typeof fireux.shortName === 'string' && fireux.shortName.trim()) ||
    (typeof pub.appShortName === 'string' && pub.appShortName.trim()) ||
    name
  const seo =
    fireux.seo && typeof fireux.seo === 'object'
      ? (fireux.seo as Record<string, unknown>)
      : {}
  const description =
    (typeof seo.defaultDescription === 'string' &&
      seo.defaultDescription.trim()) ||
    (typeof pub.appDescription === 'string' && pub.appDescription.trim()) ||
    'FireUX application'
  const theme = resolveAppTheme(useAppConfig().theme)
  const themeColor = theme?.palette.accent || DEFAULT_THEME
  const backgroundColor = theme?.palette.canvas || DEFAULT_BACKGROUND

  const appConfig = runtimeConfig.app
  const buildId =
    appConfig && typeof appConfig === 'object' && 'buildId' in appConfig
      ? appConfig.buildId
      : undefined

  return {
    // A route-installed surface such as a Kitchen Kiosk must remain distinct
    // from the App's root installation and from every other installed Kiosk.
    id: startUrl,
    name: name + nameSuffix,
    short_name: shortName + nameSuffix,
    description,
    lang: 'en',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: themeColor,
    icons: [
      {
        src: withBuildVersion(brandAssets.pwaIcon192, buildId),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: withBuildVersion(brandAssets.pwaIcon512, buildId),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
