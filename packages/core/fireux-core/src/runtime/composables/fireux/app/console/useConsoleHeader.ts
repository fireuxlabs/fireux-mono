import { useState } from '#imports'
import { type ComputedRef, unref, watchEffect, type Ref } from 'vue'
import { normalizeString } from '../../../../utils/string'

export type ConsoleHeaderData = {
  title: string
  subtitle?: string
  imageUrl?: string
  selectorItems?: ConsoleHeaderSelectorItem[][]
} | null

export type ConsoleHeaderSelectorItem = {
  label: string
  icon?: string
  disabled?: boolean
  onSelect?: () => void
}

type HeaderRef = Ref<ConsoleHeaderData> | ComputedRef<ConsoleHeaderData>

export function useConsoleHeaders() {
  return useState<Record<string, ConsoleHeaderData>>('console:headers', () => ({}))
}

export function usePublishConsoleHeader(family: string, header: HeaderRef) {
  const consoleHeaders = useConsoleHeaders()
  const normalizedFamily = normalizeString(family)

  watchEffect(() => {
    consoleHeaders.value[normalizedFamily] = unref(header)
  })

  return consoleHeaders
}
