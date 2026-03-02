import { computed } from 'vue'
import { useRouter } from 'vue-router'

type UseConsoleEntryCtaOptions = {
  consolePath?: string
  requireRuntimeScope?: boolean
}

export function useConsoleEntryCta(options: UseConsoleEntryCtaOptions = {}) {
  const router = useRouter()
  const consolePath = String(options.consolePath || '/console').trim() || '/console'
  const requireRuntimeScope = options.requireRuntimeScope !== false

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

  const hasConsoleEntry = computed(() =>
    requireRuntimeScope
      ? hasConsoleRoute.value && hasRuntimeScopeRoute.value
      : hasConsoleRoute.value
  )

  return {
    hasConsoleRoute,
    hasRuntimeScopeRoute,
    hasConsoleEntry,
    consolePath,
  }
}
