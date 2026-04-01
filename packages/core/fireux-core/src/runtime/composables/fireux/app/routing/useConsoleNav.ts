import { useCookie, useRoute } from '#imports'
import { computed } from 'vue'
import { useNav } from '../ui/nav/useNav'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

function normalizeSelectedId(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const source = value as Record<string, unknown>
  return String(
    source.selectedId ??
      source.projectId ??
      source.kitchenId ??
      source.portfolioId ??
      source.supplierId ??
      ''
  ).trim()
}

function hasActiveSelectionForScope(
  scope: string,
  selections: {
    project: { value: Record<string, unknown> | null | undefined }
    kitchen: { value: Record<string, unknown> | null | undefined }
    portfolio: { value: Record<string, unknown> | null | undefined }
    supplier: { value: Record<string, unknown> | null | undefined }
  }
) {
  if (scope === 'projects') return Boolean(normalizeSelectedId(selections.project.value))
  if (scope === 'kitchen') return Boolean(normalizeSelectedId(selections.kitchen.value))
  if (scope === 'portfolio') return Boolean(normalizeSelectedId(selections.portfolio.value))
  if (scope === 'supplier') return Boolean(normalizeSelectedId(selections.supplier.value))
  return false
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const route = useRoute()
  const projectSelection = useCookie<Record<string, unknown>>('fireux_runtime_project')
  const kitchenSelection = useCookie<Record<string, unknown>>('fireux_runtime_kitchen')
  const portfolioSelection = useCookie<Record<string, unknown>>('fireux_runtime_portfolio')
  const supplierSelection = useCookie<Record<string, unknown>>('fireux_runtime_supplier')

  const filterItems = (items: typeof nav.items.value) => {
    const currentPath = normalizePath(route.path)
    const scopeMatch = currentPath.match(/^\/console\/([^/]+)(?:\/.*)?$/)
    if (!scopeMatch) return items

    const scope = String(scopeMatch[1] || '').trim()
    const scopeRoot = `/console/${scope}`
    const createPath = `${scopeRoot}/create`
    const isScopeRoot = currentPath === scopeRoot
    const isCreateRoute = currentPath === createPath
    const hasActiveSelection = hasActiveSelectionForScope(scope, {
      project: projectSelection,
      kitchen: kitchenSelection,
      portfolio: portfolioSelection,
      supplier: supplierSelection,
    })

    return items.filter((item) => {
      const path = normalizePath(item.to)
      if (!path.startsWith('/console/')) return true
      if (path === scopeRoot) return false
      if (!path.startsWith(`${scopeRoot}/`)) return false
      if (isCreateRoute) return path === createPath
      if (!hasActiveSelection) return path === createPath
      if (isScopeRoot) return true
      return true
    })
  }

  const items = computed(() => filterItems(nav.items.value))
  const desktop = computed(() => filterItems(nav.desktop.value))
  const mobile = computed(() => filterItems(nav.mobile.value))

  return {
    ...nav,
    items,
    desktop,
    mobile,
  }
}
