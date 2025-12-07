import type { TenantConfig } from './tenant-config'

export interface TenantBasics {
  ecosystem: string
  appName: string
  appShortName: string
  appDescription: string
  role: 'global' | 'tenant'
  includeCore: boolean
}

export function resolveTenantBasics(opts: TenantConfig): TenantBasics {
  const role = requireTenantField('role', opts.role)
  if (role !== 'global' && role !== 'tenant') {
    throw new Error('[fireux] createFireuxConfig requires role to be global or tenant.')
  }

  return {
    ecosystem: requireTenantField('ecosystem', opts.ecosystem),
    appName: requireTenantField('appName', opts.appName),
    appShortName: requireTenantField('appShortName', opts.appShortName),
    appDescription: requireTenantField('appDescription', opts.appDescription),
    role,
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
