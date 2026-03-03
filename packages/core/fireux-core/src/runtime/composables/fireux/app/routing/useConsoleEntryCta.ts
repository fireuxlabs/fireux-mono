import { computed } from 'vue'
import { useRouter } from 'vue-router'

type UseConsoleEntryCtaOptions = {
  consolePath?: string
  requireRuntimeScope?: boolean
  preferredRuntimeKey?: string
}

export function useConsoleEntryCta(options: UseConsoleEntryCtaOptions = {}) {
  const router = useRouter()
  const consolePath = String(options.consolePath || '/console').trim() || '/console'
  const requireRuntimeScope = options.requireRuntimeScope !== false
  const preferredRuntimeKey = String(options.preferredRuntimeKey || '')
    .trim()
    .toLowerCase()
  const normalizedConsolePath = consolePath.endsWith('/')
    ? consolePath.slice(0, -1)
    : consolePath

  const hasConsoleRoute = computed(() =>
    router.getRoutes().some((route) => route.path === consolePath)
  )

  // A console is considered "offered" only when it has at least one runtime scope route
  // like /console/app, /console/kitchen, /console/portfolio, etc.
  const hasRuntimeScopeRoute = computed(() =>
    router
      .getRoutes()
      .some((route) => route.path.startsWith(`${consolePath}/`))
  )

  const runtimeScopes = computed(() => {
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
        const exact = paths.some((path) => path === explicit)
        const path = exact ? explicit : paths.sort()[0] || explicit
        return { key, path }
      })
      .sort((a, b) => a.key.localeCompare(b.key))
  })

  const runtimeScopeKey = computed(() => {
    if (preferredRuntimeKey) {
      const match = runtimeScopes.value.find((scope) => scope.key === preferredRuntimeKey)
      if (match) return match.key
    }
    return runtimeScopes.value[0]?.key ?? ''
  })

  const runtimeScopeLabel = computed(() => {
    if (!runtimeScopeKey.value) return 'Runtime'
    return runtimeScopeKey.value
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(' ')
  })

  const consoleEntryLabel = computed(() => `${runtimeScopeLabel.value} Console`)

  const hasConsoleEntry = computed(() =>
    requireRuntimeScope
      ? hasConsoleRoute.value && hasRuntimeScopeRoute.value
      : hasConsoleRoute.value
  )

  const consoleEntryPath = computed(() => {
    if (!hasConsoleEntry.value) return consolePath
    if (runtimeScopes.value.length === 1) return runtimeScopes.value[0]?.path || consolePath

    if (preferredRuntimeKey) {
      const match = runtimeScopes.value.find((scope) => scope.key === preferredRuntimeKey)
      if (match) return match.path
    }

    return consolePath
  })

  return {
    hasConsoleRoute,
    hasRuntimeScopeRoute,
    hasConsoleEntry,
    runtimeScopeKey,
    runtimeScopeLabel,
    consoleEntryLabel,
    consoleEntryPath,
    runtimeScopes,
    preferredRuntimeKey,
    consolePath,
  }
}
