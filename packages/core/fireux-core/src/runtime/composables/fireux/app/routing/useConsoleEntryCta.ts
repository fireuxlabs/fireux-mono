import { computed } from 'vue'
import { useRouter } from 'vue-router'

type UseConsoleEntryCtaOptions = {
  consolePath?: string
}

export function useConsoleEntryCta(options: UseConsoleEntryCtaOptions = {}) {
  const router = useRouter()
  const consolePath = String(options.consolePath || '/console').trim() || '/console'
  const normalizedConsolePath = consolePath.endsWith('/')
    ? consolePath.slice(0, -1)
    : consolePath

  const hasConsoleRoute = computed(() =>
    router.getRoutes().some((route) => route.path === consolePath)
  )

  const consoleChildren = computed(() => {
    const byKey = new Map<string, string[]>()

    for (const route of router.getRoutes()) {
      const path = String(route.path || '')
      if (!path.startsWith(`${normalizedConsolePath}/`)) continue
      const suffix = path.slice(normalizedConsolePath.length + 1)
      const [scope] = suffix.split('/')
      const normalized = String(scope || '').trim().toLowerCase()
      if (!normalized || normalized.startsWith(':') || normalized.includes('[')) continue

      const list = byKey.get(normalized) ?? []
      list.push(path)
      byKey.set(normalized, list)
    }

    return Array.from(byKey.entries())
      .map(([key, paths]) => {
        const explicit = `${normalizedConsolePath}/${key}`
        const overview = `${normalizedConsolePath}/${key}/overview`
        const hasOverview = paths.some((path) => path === overview)
        const exact = paths.some((path) => path === explicit)
        const path = hasOverview
          ? overview
          : exact
            ? explicit
            : paths.sort()[0] || explicit
        return { key, path }
      })
      .sort((a, b) => a.key.localeCompare(b.key))
  })

  const hasConsoleChildren = computed(() => consoleChildren.value.length > 0)
  const hasConsoleEntry = computed(() => hasConsoleRoute.value)
  const consoleEntryPath = computed(() => (hasConsoleRoute.value ? consolePath : '/'))

  return {
    hasConsoleRoute,
    hasConsoleChildren,
    hasConsoleEntry,
    consoleEntryPath,
    consolePath: normalizedConsolePath,
    consoleChildren,
  }
}
