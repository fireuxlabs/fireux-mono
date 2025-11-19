export interface PwaConfigOptions {
  appName: string
  appShortName: string
  themeColor?: string
  overrides?: Record<string, any>
}

export function createPwaConfig(
  options: PwaConfigOptions
): Record<string, any> {
  const { appName, appShortName, themeColor, overrides } = options

  const base = {
    registerType: 'autoUpdate',
    manifest: {
      name: appName,
      short_name: appShortName,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: themeColor,
    },
  }

  return { ...base, ...(overrides ?? {}) }
}
