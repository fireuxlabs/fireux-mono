import type { NavMeta } from '../../../../../types/nav'

// Macro is provided by Nuxt runtime; declare optional shape for package builds.
declare const definePageMeta:
  | ((meta: Record<string, unknown>) => void)
  | undefined

type DefineNavOptions = NavMeta & {
  requiresAuth?: boolean
  roles?: string[]
  tenant?: string
}

function normaliseLayouts(value: NavMeta['layouts']): string[] | undefined {
  if (!value || value.length === 0) return undefined
  return value
}

export function defineNav(meta: DefineNavOptions) {
  const { requiresAuth, roles, tenant, ...navMeta } = meta
  const layouts = normaliseLayouts(navMeta.layouts)

  // Skip when the macro is unavailable (e.g. package-level tsc)
  if (typeof definePageMeta !== 'function') return

  definePageMeta({
    nav: {
      group: navMeta.group ?? 'Other',
      order: navMeta.order ?? 999,
      desktop: navMeta.desktop ?? false,
      mobile: navMeta.mobile ?? false,
      ...navMeta,
      ...(layouts ? { layouts } : {}),
    },
    requiresAuth: requiresAuth ?? false,
    roles: roles ?? [],
    tenant,
  })
}
