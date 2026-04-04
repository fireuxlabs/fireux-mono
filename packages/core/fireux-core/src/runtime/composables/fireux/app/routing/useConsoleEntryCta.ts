import { computed } from 'vue'
import {
  CONSOLE_ROOT,
  normalizeConsoleFamily,
  toConsoleFamilyPath,
  type ConsoleFamilyRoute,
} from './consoleRoutes'
import { useFireUXConfig } from '../FireUXConfig'

export function useConsoleEntryCta() {
  const fireux = useFireUXConfig()
  const consoleFamilies = computed<ConsoleFamilyRoute[]>(() =>
    Array.from(
      new Set(
        (fireux.consoleFamilies || [])
          .map((value) => normalizeConsoleFamily(value))
          .filter(Boolean)
      )
    )
      .map((key) => ({
        key,
        path: toConsoleFamilyPath(key),
      }))
  )

  const hasConsoleFamilies = computed(() => consoleFamilies.value.length > 0)
  const hasConsoleEntry = computed(() => hasConsoleFamilies.value)
  const consoleEntryPath = computed(() =>
    consoleFamilies.value[0]?.path || '/'
  )

  return {
    hasConsoleFamilies,
    hasConsoleEntry,
    consoleEntryPath,
    consoleRootPath: CONSOLE_ROOT,
    consoleFamilies,
  }
}
