import { computed } from 'vue'
import type { ConsoleFamily } from '../../console/console.types'
import {
  CONSOLE_ROOT,
  normalizeConsoleFamily,
  toConsoleFamilyPath,
} from '../../routing/consoleRoutes'
import { useFireUXConfig } from '../../FireUXConfig'

type ConsoleEntryFamily = {
  key: ConsoleFamily
  path: string
}

export function useConsoleEntryCta() {
  const fireux = useFireUXConfig()
  const consoles = computed<ConsoleEntryFamily[]>(() =>
    Array.from(
      new Set(
        (fireux.consoles || [])
          .map((value) => normalizeConsoleFamily(value))
          .filter(Boolean)
      )
    )
      .map((key) => ({
        key,
        path: toConsoleFamilyPath(key),
      }))
  )

  const hasConsoles = computed(() => consoles.value.length > 0)
  const hasConsoleEntry = computed(() => hasConsoles.value)
  const consoleEntryPath = computed(() =>
    consoles.value[0]?.path || '/'
  )

  return {
    hasConsoles,
    hasConsoleEntry,
    consoleEntryPath,
    consoleRootPath: CONSOLE_ROOT,
    consoles,
  }
}
