import { useState } from '#imports'
import { computed } from 'vue'
import { normalizeString } from '../../../utils/string'
import { normalizeConsoleFamily } from './useConsole'
import {
  normalizeConsoleDataType,
  type ConsoleDataType,
} from './useConsoleData'

export type ConsoleDataAuthority = Readonly<{
  id: string
  type: ConsoleDataType
}>

/**
 * Request-local authority resolved by a Console provider.
 *
 * Selection persists intent. This state becomes writable authority only after
 * the provider resolves the exact selected `{ id, type }` target envelope.
 */
export function useConsoleDataAuthority(family: string) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const state = useState<ConsoleDataAuthority | null>(
    `fireux-console-${normalizedFamily}-data-authority`,
    () => null
  )
  const authority = computed<ConsoleDataAuthority | null>(() => {
    const id = normalizeString(state.value?.id)
    const type = normalizeConsoleDataType(state.value?.type)
    return id && type ? { id, type } : null
  })

  const setAuthority = (
    id: string | null | undefined,
    type: ConsoleDataType | null | undefined
  ) => {
    const nextId = normalizeString(id)
    const nextType = normalizeConsoleDataType(type)
    state.value =
      nextId && nextType
        ? {
            id: nextId,
            type: nextType,
          }
        : null
  }

  const clearAuthority = () => {
    state.value = null
  }

  return {
    authority,
    setAuthority,
    clearAuthority,
  }
}
