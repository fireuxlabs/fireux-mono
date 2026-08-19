import { computed } from 'vue'
import {
  CONSOLE_ROOT,
  type ConsoleFamily,
  normalizeConsoleFamily,
  toConsoleFamilyLabel,
  toConsoleFamilyPath,
} from './consoleRoutes'
import { useConsole } from './useConsole'

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
  const consoleRoot = useConsole()
  const consoles = computed<ConsoleEntryFamily[]>(() =>
    Array.from(
      new Set(
        consoleRoot.families
          .map((value) => normalizeConsoleFamily(value))
          .filter(Boolean)
      )
    ).map((key) => ({
      key,
      path: toConsoleFamilyPath(key),
    }))
  )

  const hasConsoles = computed(() => consoles.value.length > 0)
  const hasConsoleEntry = computed(() => hasConsoles.value)
  const consoleEntryPath = computed(() => consoles.value[0]?.path || '/')
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
