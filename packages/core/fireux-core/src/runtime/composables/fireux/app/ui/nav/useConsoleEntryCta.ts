import { computed } from 'vue'
import type { ConsoleFamily } from '../../console/console.types'
import {
  CONSOLE_ROOT,
  normalizeConsoleFamily,
  toConsoleFamilyLabel,
  toConsoleFamilyPath,
} from '../../routing/consoleRoutes'
import { useFireUXConfig } from '../../FireUXConfig'

type ConsoleEntryFamily = {
  key: ConsoleFamily
  path: string
}

export type ConsoleEntryAction = {
  key: ConsoleFamily
  label: string
  path: string
  icon: string
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
  const consoleActions = computed<ConsoleEntryAction[]>(() =>
    consoles.value.length
      ? consoles.value.map((entry) => ({
          key: entry.key,
          path: entry.path,
          label: `${toConsoleFamilyLabel(entry.key)} Console`,
          icon: 'i-lucide-circle-play',
        }))
      : []
  )

  return {
    consoleActions,
    hasConsoles,
    hasConsoleEntry,
    consoleEntryPath,
    consoleRootPath: CONSOLE_ROOT,
    consoles,
  }
}
