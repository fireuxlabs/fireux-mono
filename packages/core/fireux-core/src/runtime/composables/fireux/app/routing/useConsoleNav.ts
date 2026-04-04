import { computed } from 'vue'
import { useRoute, useState } from '#imports'
import { useNav } from '../ui/nav/useNav'
import {
  consoleFamilyFromPath,
  createDefaultRuntimeSelectionState,
  toConsoleSelectionStateKey,
} from './consoleRoutes'
import type { RuntimeSelectionState } from '../../runtime/runtime.types'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

function isConsoleRootPath(path: string) {
  return /^\/console\/[^/]+$/.test(path)
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const route = useRoute()
  const activeFamily = computed(() => consoleFamilyFromPath(normalizePath(route.path)))
  const activeSelection = computed(() => {
    const family = activeFamily.value
    if (!family) return null
    return useState<RuntimeSelectionState>(
      toConsoleSelectionStateKey(family),
      createDefaultRuntimeSelectionState
    ).value
  })
  const hasSelectedTarget = computed(() =>
    Boolean(String(activeSelection.value?.selectedId || '').trim())
  )

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
