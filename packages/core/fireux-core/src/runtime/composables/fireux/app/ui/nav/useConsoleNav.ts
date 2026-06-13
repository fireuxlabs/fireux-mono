import { computed } from 'vue'
import { useRoute } from '#imports'
import { useNav } from './useNav'
import {
  normalizeConsoleFamily,
  consoleFamilyFromPath,
} from '../../routing/consoleRoutes'
import {
  useConsole,
  useConsoleConfig,
  useConsoleFamilies,
} from '../../console/useConsole'
import type { NavItem, NavPosition } from '../../nav.types'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
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
  const consoleConfig = useConsoleConfig()
  const { families } = useConsoleFamilies()
  const enabledFamilies = computed(
    () =>
      new Set(
        families
          .map((value) => normalizeConsoleFamily(value))
          .filter(Boolean)
      )
  )
  const activeFamily = computed(() => consoleFamilyFromPath(normalizePath(route.path)))
  const activeSelectionId = computed(() => {
    const family = activeFamily.value
    if (!family) return ''
    return useConsole(family).selectedId.value
  })
  const hasSelectedTarget = computed(() =>
    Boolean(String(activeSelectionId.value || '').trim())
  )

  const baseNavFilter = (item: NavItem) => {
    const path = normalizePath(item.to)
    if (path === '/console') return true
    if (!path.startsWith('/console/')) return true

    const itemFamily = consoleFamilyFromPath(path)
    if (!itemFamily) return false
    if (!enabledFamilies.value.has(itemFamily)) return false
    if (
      isConsoleCreatePath(path) &&
      !consoleConfig.canCreateTarget(itemFamily)
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

  const items = computed(() => nav.items.value.filter((item) => baseNavFilter(item)))
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
