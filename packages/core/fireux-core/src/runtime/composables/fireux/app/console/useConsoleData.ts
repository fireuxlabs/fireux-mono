import { normalizeString } from '../../../../utils/string'
import type { ConsoleSource } from './useConsole'

export type ConsoleDataType = ConsoleSource

/**
 * Non-persisted provenance for data entering a Console runtime.
 *
 * The envelope keeps Console metadata out of domain records. Providers create
 * it at their boundary; views receive only `value`.
 */
export type ConsoleData<T> = Readonly<{
  type: ConsoleDataType
  value: T
}>

export function normalizeConsoleDataType(
  value: unknown
): ConsoleDataType | null {
  const dataType = normalizeString(value).toLowerCase()
  if (dataType === 'demo' || dataType === 'test' || dataType === 'live') {
    return dataType
  }
  return null
}

export function consoleData<T>(
  type: ConsoleDataType,
  value: T
): ConsoleData<T> {
  const normalizedType = normalizeConsoleDataType(type)
  if (!normalizedType) {
    throw new Error('Console data requires a valid type.')
  }
  return {
    type: normalizedType,
    value,
  }
}

export function isConsoleDemoData<T>(
  data: ConsoleData<T> | null | undefined
): boolean {
  return data?.type === 'demo'
}
