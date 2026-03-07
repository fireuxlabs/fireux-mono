import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { discoverConsoleChildren, normalizeConsolePath } from './consoleRoutes'

type UseConsoleEntryCtaOptions = {
  consolePath?: string
}

export function useConsoleEntryCta(options: UseConsoleEntryCtaOptions = {}) {
  const router = useRouter()
  const normalizedConsolePath = normalizeConsolePath(options.consolePath)

  const hasConsoleRoute = computed(() =>
    router.getRoutes().some((route) => route.path === normalizedConsolePath)
  )

  const consoleChildren = computed(() =>
    discoverConsoleChildren(router.getRoutes(), normalizedConsolePath)
  )

  const hasConsoleChildren = computed(() => consoleChildren.value.length > 0)
  const hasConsoleEntry = computed(() =>
    hasConsoleRoute.value || hasConsoleChildren.value
  )
  const consoleEntryPath = computed(() =>
    hasConsoleRoute.value
      ? normalizedConsolePath
      : consoleChildren.value[0]?.path || '/'
  )

  return {
    hasConsoleRoute,
    hasConsoleChildren,
    hasConsoleEntry,
    consoleEntryPath,
    consolePath: normalizedConsolePath,
    consoleChildren,
  }
}
