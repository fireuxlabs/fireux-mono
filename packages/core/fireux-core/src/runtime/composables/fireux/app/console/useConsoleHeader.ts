import { useState } from '#imports'
import { type ComputedRef, unref, watchEffect, type Ref } from 'vue'

export type ConsoleHeaderData = {
  title: string
  subtitle?: string
  imageUrl?: string
} | null

type HeaderRef = Ref<ConsoleHeaderData> | ComputedRef<ConsoleHeaderData>

const normalizeFamily = (value: unknown) => String(value ?? '').trim()

export function useConsoleHeaders() {
  return useState<Record<string, ConsoleHeaderData>>('console:headers', () => ({}))
}

export function usePublishConsoleHeader(family: string, header: HeaderRef) {
  const consoleHeaders = useConsoleHeaders()
  const normalizedFamily = normalizeFamily(family)

  watchEffect(() => {
    consoleHeaders.value[normalizedFamily] = unref(header)
  })

  return consoleHeaders
}
