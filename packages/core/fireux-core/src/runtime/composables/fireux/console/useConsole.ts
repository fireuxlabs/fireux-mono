import { useCookie, useState } from '#imports'
import { computed, ref } from 'vue'
import { resolveConsoleCanCreate } from '../../../utils/console-policy'
import { normalizeString, uniqueStrings } from '../../../utils/string'
import type {
  FireuxConsoleConfig,
  FireuxConsoleFamilyConfig,
} from '../../../../config/app/types'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'

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
  const appScope = normalizeConsoleFamily(fireux.appId) || 'app'
  const sourceCookie = normalizedFamily
    ? useCookie<ConsoleSource>(`fireux-console-${appScope}-${normalizedFamily}-source`, {
        default: () => 'live',
        sameSite: 'lax',
      })
    : ref<ConsoleSource>('live')
  const sourceState = normalizedFamily
    ? useState<ConsoleSource>(
        `fireux-console-${appScope}-${normalizedFamily}-source-state`,
        () => normalizeConsoleSource(sourceCookie.value)
      )
    : ref<ConsoleSource>('live')
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
  const activeFamilyCookie = useCookie<string>(
    `fireux-console-${appScope}-active-family`,
    { default: () => '', sameSite: 'lax' }
  )
  const activeFamily = useState<string>(
    `fireux-console-${appScope}-active-family`,
    () => normalizeConsoleFamily(activeFamilyCookie.value)
  )
  const activeOperation = useState<string>(
    `fireux-console-${appScope}-active-operation`,
    () => ''
  )

  const configFor = (targetFamily = family) => {
    const key = normalizeConsoleFamily(targetFamily)
    return key ? config[key] : undefined
  }

  const canCreateTarget = (targetFamily = family) => {
    const key = normalizeConsoleFamily(targetFamily)
    if (key === normalizedFamily && readOnly.value) return false

    return resolveConsoleCanCreate(fireux.role, config, targetFamily)
  }

  const allowsDemo = (targetFamily = family) =>
    configFor(targetFamily)?.allowDemo !== false

  const setSource = (value: ConsoleSource = 'live') => {
    const nextSource = normalizeConsoleSource(value)
    sourceState.value = nextSource
    sourceCookie.value = nextSource
  }
  const resetSource = () => setSource('live')
  const setActiveContext = (targetFamily = '', operation = '') => {
    const nextFamily = normalizeConsoleFamily(targetFamily)
    activeFamily.value = families.includes(nextFamily) ? nextFamily : ''
    activeFamilyCookie.value = activeFamily.value
    activeOperation.value = activeFamily.value
      ? normalizeConsoleFamily(operation)
      : ''
  }

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
    activeFamily,
    activeOperation,
    config,
    configFor,
    allowsDemo,
    canCreateTarget,
    setSource,
    resetSource,
    setActiveContext,
  }
}
