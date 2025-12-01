export interface PwaConfigOptions {
  appName: string
  appShortName: string
  themeColor?: string
  overrides?: Record<string, any>
}

const DEFAULT_BACKGROUND = '#ffffff'
const DEFAULT_THEME = '#0f172a'

export function createPwaConfig(
  options: PwaConfigOptions
): Record<string, any> {
  const { appName, appShortName, themeColor, overrides } = options
  const resolvedTheme = themeColor ?? DEFAULT_THEME

  const base = {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: { navigateFallback: '/' },
    manifest: {
      name: appName,
      short_name: appShortName || appName,
      description: `${appName} progressive web app`,
      scope: '/',
      start_url: '/',
      display: 'standalone',
      background_color: DEFAULT_BACKGROUND,
      theme_color: resolvedTheme,
      lang: 'en',
      icons: [
        {
          src: '/img/app/pwa/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/img/app/pwa/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  }

  return mergePwaOptions(base, overrides)
}

function mergePwaOptions(
  base: Record<string, any>,
  overrides?: Record<string, any>
): Record<string, any> {
  if (!overrides) {
    return base
  }

  return deepMerge(base, overrides)
}

function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const current = result[key]

    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value)
    } else {
      result[key] = value
    }
  }

  return result
}

const isPlainObject = (value: unknown): value is Record<string, any> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))
