// packages/core/fireux-core/src/runtime/composables/app/nav/defineNav.ts
import type { NavMeta } from '../../../types/nav'

// Nuxt macro shim for package typechecking (apps provide the real macro)
declare function definePageMeta(meta: any): void

/** Sugar to enforce `NavMeta` shape + common defaults */
export function defineNav(
  meta: NavMeta & {
    requiresAuth?: boolean
    roles?: string[]
    tenant?: string
  }
) {
  definePageMeta({
    nav: {
      group: 'Other',
      order: 999,
      area: 'default',
      desktop: false,
      mobile: false,
      ...meta,
    },
    requiresAuth: meta.requiresAuth ?? false,
    roles: meta.roles ?? [],
    tenant: meta.tenant,
  })
}
