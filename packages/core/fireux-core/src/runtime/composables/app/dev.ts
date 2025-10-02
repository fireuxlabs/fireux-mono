// Grouping helper for dev pages
import { computed } from 'vue'
import type { NavItem } from './nav'
import { useNav } from './nav'

type Groups = {
  Core: NavItem[]
  Tenancy: NavItem[]
  Modules: NavItem[]
  App: NavItem[]
  Other: NavItem[]
}

const TITLE_BY_GROUP: Record<string, keyof Groups> = {
  core: 'Core',
  misebox: 'Tenancy',
  tenant: 'Tenancy',
  tenantID: 'Tenancy',
  ext: 'Modules',
  module: 'Modules',
  modules: 'Modules',
  app: 'App',
}

export function useDevPages() {
  const { desktop } = useNav('dev')

  const groups = computed<Groups>(() => {
    const base: Groups = {
      Core: [],
      Tenancy: [],
      Modules: [],
      App: [],
      Other: [],
    }
    const items = desktop.value ?? []
    for (const item of items) {
      const key = (item.group || '').trim()
      const bucket = TITLE_BY_GROUP[key] || 'Other'
      base[bucket].push(item)
    }

    // Sort inside each bucket using optional order then label
    for (const k of Object.keys(base) as (keyof Groups)[]) {
      base[k].sort((a, b) => {
        const ao = a.order ?? Number.MAX_SAFE_INTEGER
        const bo = b.order ?? Number.MAX_SAFE_INTEGER
        if (ao !== bo) return ao - bo
        return a.label.localeCompare(b.label)
      })
    }
    return base
  })

  return { groups }
}
