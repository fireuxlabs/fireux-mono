import { computed } from 'vue'
import { useRoute, useState } from '#imports'
import { useNav } from '../ui/nav/useNav'
import { consoleFamilyFromPath } from './consoleRoutes'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

function normalizeString(value: unknown): string {
  return String(value || '').trim()
}

function isConsoleRootPath(path: string) {
  return /^\/console\/[^/]+$/.test(path)
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const route = useRoute()
  const activeFamily = computed(() => consoleFamilyFromPath(normalizePath(route.path)))
  const projectSelection = useState<Record<string, unknown>>('fireux_runtime_project', () => ({
    selectedId: '',
    mode: 'read-only',
  }))
  const kitchenSelection = useState<Record<string, unknown>>('fireux_runtime_kitchen', () => ({
    selectedId: '',
    mode: 'read-only',
  }))
  const portfolioSelection = useState<Record<string, unknown>>('fireux_runtime_portfolio', () => ({
    selectedId: '',
    mode: 'read-only',
  }))
  const supplierSelection = useState<Record<string, unknown>>('fireux_runtime_supplier', () => ({
    selectedId: '',
    mode: 'read-only',
  }))

  const hasSelectedTarget = computed(() => {
    const family = activeFamily.value
    if (family === 'projects') return Boolean(normalizeString(projectSelection.value?.selectedId))
    if (family === 'kitchen') return Boolean(normalizeString(kitchenSelection.value?.selectedId))
    if (family === 'portfolio') return Boolean(normalizeString(portfolioSelection.value?.selectedId))
    if (family === 'supplier') return Boolean(normalizeString(supplierSelection.value?.selectedId))
    return false
  })

  const filterItems = (items: typeof nav.items.value) => {
    return items.filter((item) => {
      const path = normalizePath(item.to)
      if (path === '/console') return true
      if (!path.startsWith('/console/')) return true

      const itemFamily = consoleFamilyFromPath(path)
      if (!itemFamily) return false

      if (isConsoleRootPath(path)) {
        const family = activeFamily.value
        if (!family) return true
        return itemFamily === family
      }

      const family = activeFamily.value
      if (!family) return false
      if (itemFamily !== family) return false

      return hasSelectedTarget.value
    })
  }

  const items = computed(() => filterItems(nav.items.value))
  const desktop = computed(() => items.value.filter((item) => item.desktop))
  const mobile = computed(() => items.value.filter((item) => item.mobile))

  return {
    ...nav,
    items,
    desktop,
    mobile,
  }
}
