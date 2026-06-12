import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { resolveFireuxBrandAssets } from '../../utils/brandAssets'

const DEFAULT_BACKGROUND = '#ffffff'
const DEFAULT_THEME = '#0f172a'

export default defineEventHandler((event) => {
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
    (typeof fireux.primaryColor === 'string' && fireux.primaryColor.trim()) ||
    (typeof pub.primaryColor === 'string' && pub.primaryColor.trim()) ||
    DEFAULT_THEME
  const brandAssets = resolveFireuxBrandAssets()

  setHeader(event, 'content-type', 'application/manifest+json')

  return {
    name,
    short_name: shortName,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: DEFAULT_BACKGROUND,
    theme_color: themeColor,
    icons: [
      {
        src: brandAssets.pwaIcon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: brandAssets.pwaIcon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
})
