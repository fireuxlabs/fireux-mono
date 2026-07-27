import { computed } from 'vue'
import { normalizeConsoleFamily } from './useConsole'
import type { ConsoleDataType } from './useConsoleData'
import { useConsoleDataAuthority } from './useConsoleDataAuthority'
import { useConsoleSelection } from './useConsoleSelection'

export class ConsoleDataReadOnlyError extends Error {
  readonly code = 'console-data-read-only'

  constructor(family: string) {
    super(
      `${family || 'Console'} Demo data is read-only.`
    )
    this.name = 'ConsoleDataReadOnlyError'
  }
}

/**
 * Defense-in-depth for Console mutation, HTTP, and upload adapters.
 *
 * Server authorization and Firestore Rules remain authoritative. This gate
 * prevents a Demo-selected parent from issuing a Live request at all.
 */
export function useConsoleWriteGuard(family: string) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const selection = useConsoleSelection(normalizedFamily)
  const { authority } = useConsoleDataAuthority(normalizedFamily)
  const selectedType = computed<ConsoleDataType | null>(() => {
    const resolved = authority.value
    return resolved &&
      resolved.id === selection.selectedId.value &&
      resolved.type === selection.selectedType.value
      ? resolved.type
      : null
  })
  const isDemo = computed(
    () =>
      selection.selectedType.value === 'demo' &&
      selectedType.value === 'demo'
  )

  const requireWritableData = (
    expectedType?: ConsoleDataType
  ): Exclude<ConsoleDataType, 'demo'> => {
    const type = selectedType.value
    if (
      !type ||
      type === 'demo' ||
      (expectedType !== undefined && type !== expectedType)
    ) {
      throw new ConsoleDataReadOnlyError(normalizedFamily)
    }
    return type
  }

  return {
    selectedType,
    isDemo,
    requireWritableData,
  }
}
