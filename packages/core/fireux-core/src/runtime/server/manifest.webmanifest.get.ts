import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'

const DEFAULT_BACKGROUND = '#ffffff'
const DEFAULT_THEME = '#0f172a'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const pub = runtimeConfig.public || {}
  const name = pub.appName || 'FireUX'
  const shortName = pub.appShortName || name
  const description = pub.appDescription || 'FireUX application'
  const themeColor = pub.primaryColor || DEFAULT_THEME

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
        src: '/img/app/pwa/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/img/app/pwa/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
})
