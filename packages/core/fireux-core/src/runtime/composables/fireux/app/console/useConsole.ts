import { useCookie, useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { resolveConsoleCanCreate } from '../../../../utils/console-policy'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import type {
  FireuxConsoleConfig,
  FireuxConsoleFamilyConfig,
} from '../../../../../config/app/types'
import { useFireUXConfig } from '../FireUXConfig'

export type ConsoleAppMode = 'tenant' | 'global' | 'standalone'
export type ConsoleSource = 'live' | 'test' | 'demo'
export type ConsoleFamilyConfig = FireuxConsoleFamilyConfig
export type ConsoleConfig = FireuxConsoleConfig

export function normalizeConsoleFamily(value: unknown) {
  return normalizeString(value).toLowerCase()
}

export function normalizeConsoleSource(value: unknown): ConsoleSource {
  const source = normalizeString(value).toLowerCase()
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

export function useConsole(family = '') {
  const fireux = useFireUXConfig()
  const normalizedFamily = normalizeConsoleFamily(family)
  const sourceCookie = normalizedFamily
    ? useCookie<ConsoleSource>(`fireux-console-${normalizedFamily}-source`, {
        default: () => 'live',
        sameSite: 'lax',
      })
    : ref<ConsoleSource>('live')
  const sourceState = normalizedFamily
    ? useState<ConsoleSource>(
        `fireux-console-${normalizedFamily}-source-state`,
        () => normalizeConsoleSource(sourceCookie.value)
      )
    : ref<ConsoleSource>('live')
  watch(sourceCookie, (value: ConsoleSource | null | undefined) => {
    const nextSource = normalizeConsoleSource(value)
    if (sourceState.value !== nextSource) sourceState.value = nextSource
  })
  const source = computed<ConsoleSource>(() =>
    normalizeConsoleSource(sourceState.value)
  )
  const readOnly = computed(() => source.value === 'demo')
  const mode: ConsoleAppMode = fireux.isTenant
    ? 'tenant'
    : fireux.isStandalone
      ? 'standalone'
      : 'global'
  const config = fireux.consoleConfig
  const families = uniqueStrings(fireux.consoles)

  const configFor = (targetFamily = family) => {
    const key = normalizeConsoleFamily(targetFamily)
    return key ? config[key] : undefined
  }

  const canCreateTarget = (targetFamily = family) => {
    const key = normalizeConsoleFamily(targetFamily)
    if (key === normalizedFamily && readOnly.value) return false

    return resolveConsoleCanCreate(fireux.role, config, targetFamily)
  }

  const setSource = (value: ConsoleSource = 'live') => {
    const nextSource = normalizeConsoleSource(value)
    sourceState.value = nextSource
    sourceCookie.value = nextSource
  }
  const resetSource = () => setSource('live')

  return {
    appId: fireux.appId,
    ecosystem: fireux.ecosystem,
    role: fireux.role,
    mode,
    isTenant: mode === 'tenant',
    isGlobal: mode === 'global',
    isStandalone: mode === 'standalone',
    source,
    isLive: computed(() => source.value === 'live'),
    isTest: computed(() => source.value === 'test'),
    isDemo: computed(() => source.value === 'demo'),
    readOnly,
    families,
    config,
    configFor,
    canCreateTarget,
    setSource,
    resetSource,
  }
}
