import { definePageMeta } from 'nuxt/app'
import type { NavMeta } from '../../../types/nav'

export function defineNav(
  meta: NavMeta & { requiresAuth?: boolean; roles?: string[]; tenant?: string }
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
