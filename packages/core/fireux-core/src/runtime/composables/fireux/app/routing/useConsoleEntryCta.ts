import { computed } from 'vue'
import { CONSOLE_ROOT } from './consoleRoutes'
import { useFireUXConfig } from '../FireUXConfig'

export function useConsoleEntryCta() {
  const fireux = useFireUXConfig()
  const consoleChildren = computed(() =>
    Array.from(
      new Set(
        (fireux.consoleFamilies || [])
          .map((value) => String(value || '').trim().toLowerCase())
          .filter(Boolean)
      )
    )
      .map((key) => ({
        key,
        path: `${CONSOLE_ROOT}/${key}`,
      }))
  )

  const hasConsoleChildren = computed(() => consoleChildren.value.length > 0)
  const hasConsoleEntry = computed(() => hasConsoleChildren.value)
  const consoleEntryPath = computed(() =>
    consoleChildren.value[0]?.path || '/'
  )

  return {
    hasConsoleChildren,
    hasConsoleEntry,
    consoleEntryPath,
    consolePath: CONSOLE_ROOT,
    consoleChildren,
  }
}
