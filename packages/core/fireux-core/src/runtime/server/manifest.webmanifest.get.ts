import { defineEventHandler, getQuery, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { useAssets } from '../app/composables/brand/useAssets'
import { withBuildVersion } from '../utils/buildVersionUrl'

const DEFAULT_BACKGROUND = '#ffffff'
const DEFAULT_THEME = '#0f172a'
const MANIFEST_ORIGIN = 'https://fireux.local'

function readStartUrl(value: unknown): string {
  const candidate = Array.isArray(value) ? value[0] : value
  if (typeof candidate !== 'string') return '/'

  const requestedPath = candidate.trim()
  if (!requestedPath.startsWith('/') || requestedPath.startsWith('//')) return '/'

  try {
    const url = new URL(requestedPath, MANIFEST_ORIGIN)
    if (url.origin !== MANIFEST_ORIGIN) return '/'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

function readPaletteColor(
  fireux: Record<string, unknown>,
  role: 'accent' | 'canvas'
): string | undefined {
  const theme = fireux.theme
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return
  const palette = (theme as Record<string, unknown>).palette
  if (!palette || typeof palette !== 'object' || Array.isArray(palette)) return
  const value = (palette as Record<string, unknown>)[role]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export default defineEventHandler((event) => {
  const startUrl = readStartUrl(getQuery(event).start_url)
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
  const description =
    (typeof pub.appDescription === 'string' && pub.appDescription.trim()) ||
    'FireUX application'
  const themeColor =
    readPaletteColor(fireux, 'accent') ||
    DEFAULT_THEME
  const backgroundColor =
    readPaletteColor(fireux, 'canvas') || DEFAULT_BACKGROUND
  const brandAssets = useAssets()
  const buildId = runtimeConfig.app?.buildId

  setHeader(event, 'content-type', 'application/manifest+json')

  return {
    // A route-installed surface such as a Kitchen Kiosk must remain distinct
    // from the App's root installation and from every other installed Kiosk.
    id: startUrl,
    name,
    short_name: shortName,
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
})
