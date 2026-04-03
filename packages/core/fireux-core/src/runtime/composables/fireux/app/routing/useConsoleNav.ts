import { computed } from 'vue'
import { useRoute } from '#imports'
import { useNav } from '../ui/nav/useNav'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

function isConsoleRootPath(path: string) {
  return /^\/console\/[^/]+$/.test(path)
}

function currentConsoleFamily(path: string): string {
  return path.match(/^\/console\/([^/]+)/)?.[1] || ''
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const route = useRoute()
  const activeFamily = computed(() => currentConsoleFamily(normalizePath(route.path)))

  const filterItems = (items: typeof nav.items.value) => {
    return items.filter((item) => {
      const path = normalizePath(item.to)
      if (path === '/console') return true
      if (!path.startsWith('/console/')) return true
      if (!isConsoleRootPath(path)) return false

      const family = activeFamily.value
      if (!family) return true

      return path === `/console/${family}`
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
