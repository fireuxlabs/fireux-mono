// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: pre-create family console and selection state for navigation.
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useNav } from '../app/navigation/useNav'
import {
  normalizeConsoleFamily,
  consoleFamilyFromRouteContext,
} from '../app/ui/nav/consoleRoutes'
import { useConsole } from '../app/ui/nav/useConsole'
import { useConsoleSelection } from '../app/ui/nav/useConsoleSelection'
import type { NavItem, NavPosition } from '../app/navigation/types'

function normalizePath(value: unknown): string {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
}

function isConsoleRootPath(path: string) {
  return /^\/console\/[^/]+$/.test(path)
}

function isConsoleCreatePath(path: string) {
  return /^\/console\/[^/]+\/create$/.test(path)
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const route = useRoute()
  const consoleRoot = useConsole()
  const familyNames = consoleRoot.families
    .map((value) => normalizeConsoleFamily(value))
    .filter(Boolean)
  const enabledFamilies = new Set(familyNames)
  const familyConsoles = new Map(
    familyNames.map((family) => [family, useConsole(family)] as const)
  )
  const familySelections = new Map(
    familyNames.map((family) => [family, useConsoleSelection(family)] as const)
  )
  const activeFamily = computed(
    () =>
      consoleFamilyFromRouteContext(
        normalizePath(route.path),
        route.query.family
      ) || consoleRoot.activeFamily.value
  )
  const activeSelectionId = computed(() => {
    const family = activeFamily.value
    if (!family) return ''
    return familySelections.get(family)?.selectedId.value ?? ''
  })
  const hasSelectedTarget = computed(() =>
    Boolean(String(activeSelectionId.value || '').trim())
  )

  const baseNavFilter = (item: NavItem) => {
    const path = normalizePath(item.to)
    if (path === '/console') return true
    if (!path.startsWith('/console/')) return true

    const itemFamily = consoleFamilyFromRouteContext(path)
    if (!itemFamily) return false
    if (!enabledFamilies.has(itemFamily)) return false
    if (
      isConsoleCreatePath(path) &&
      !familyConsoles.get(itemFamily)?.canCreateTarget()
    ) {
      return false
    }

    const family = activeFamily.value
    if (!family) {
      return isConsoleRootPath(path)
    }

    if (itemFamily !== family) return false

    const requiresSelection =
      typeof item.requiresSelection === 'boolean'
        ? item.requiresSelection
        : !(isConsoleRootPath(path) || isConsoleCreatePath(path))

    return !requiresSelection || hasSelectedTarget.value
  }

  const resolveItemPosition = (item: NavItem): NavPosition => {
    if (item.position) return item.position

    const path = normalizePath(item.to)
    return isConsoleRootPath(path) || isConsoleCreatePath(path)
      ? 'bottom'
      : 'middle'
  }

  const canonicalOrder = (item: NavItem) => {
    const path = normalizePath(item.to)
    if (isConsoleRootPath(path)) return 0
    if (/\/overview$/.test(path)) return 0
    if (/\/identity$/.test(path)) return 10
    if (/\/team$/.test(path)) return 10_000
    return 100 + item.order
  }
  const items = computed(() =>
    nav.items.value
      .filter((item) => baseNavFilter(item))
      .sort((left, right) => canonicalOrder(left) - canonicalOrder(right))
  )
  const desktop = computed(() => items.value.filter((item) => item.desktop))
  const mobile = computed(() => items.value.filter((item) => item.mobile))

  return {
    ...nav,
    baseNavFilter,
    resolveItemPosition,
    items,
    desktop,
    mobile,
  }
}
