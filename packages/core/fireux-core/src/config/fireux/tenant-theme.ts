import { env } from './env'
import type { TenantConfig } from './tenant-config'

export interface TenantTheme {
  primaryColor: string
  neutralColor?: string
  secondaryColor?: string
  centralSignupUrl?: string
  appIcon?: string
  developerPin?: string
}

export function resolveTenantTheme(opts: TenantConfig): TenantTheme {
  const primaryColor = opts.primaryColor ?? env('APP_PRIMARY_COLOR')
  if (!primaryColor) {
    throw new Error('[fireux] createFireuxConfig requires primaryColor (APP_PRIMARY_COLOR).')
  }

  return {
    primaryColor,
    neutralColor: opts.neutralColor ?? env('APP_NEUTRAL_COLOR'),
    secondaryColor: opts.secondaryColor ?? env('APP_SECONDARY_COLOR'),
    centralSignupUrl: env('CENTRAL_SIGNUP_URL'),
    appIcon: env('APP_ICON'),
    developerPin: env('PIN'),
  }
}
