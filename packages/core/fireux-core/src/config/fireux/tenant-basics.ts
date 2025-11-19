import type { TenantConfig } from './tenant-config'

export interface TenantBasics {
  ecosystem: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  includeCore: boolean
}

export function resolveTenantBasics(opts: TenantConfig): TenantBasics {
  return {
    ecosystem: requireTenantField('ecosystem', opts.ecosystem),
    appName: requireTenantField('appName', opts.appName),
    appShortName: requireTenantField('appShortName', opts.appShortName),
    role: opts.role,
    includeCore: opts.includeCore ?? true,
  }
}

function requireTenantField(name: string, value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    throw new Error(`[fireux] createFireuxConfig requires ${name}.`)
  }
  return trimmed
}
