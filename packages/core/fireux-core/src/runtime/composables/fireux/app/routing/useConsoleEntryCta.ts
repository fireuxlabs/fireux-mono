import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CONSOLE_ROOT, discoverConsoleChildren } from './consoleRoutes'

export function useConsoleEntryCta() {
  const router = useRouter()

  const hasConsoleRoute = computed(() =>
    router.getRoutes().some((route) => route.path === CONSOLE_ROOT)
  )

  const consoleChildren = computed(() =>
    discoverConsoleChildren(router.getRoutes())
  )

  const hasConsoleChildren = computed(() => consoleChildren.value.length > 0)
  const hasConsoleEntry = computed(() =>
    hasConsoleRoute.value || hasConsoleChildren.value
  )
  const consoleEntryPath = computed(() =>
    consoleChildren.value[0]?.path || (hasConsoleRoute.value ? CONSOLE_ROOT : '/')
  )

  return {
    hasConsoleRoute,
    hasConsoleChildren,
    hasConsoleEntry,
    consoleEntryPath,
    consolePath: CONSOLE_ROOT,
    consoleChildren,
  }
}
