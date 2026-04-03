import { computed } from 'vue'
import { useNav } from '../ui/nav/useNav'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

function isConsoleRootPath(path: string) {
  return /^\/console\/[^/]+$/.test(path)
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])

  const filterItems = (items: typeof nav.items.value) => {
    return items.filter((item) => {
      const path = normalizePath(item.to)
      if (!path.startsWith('/console/')) return true
      return isConsoleRootPath(path)
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
