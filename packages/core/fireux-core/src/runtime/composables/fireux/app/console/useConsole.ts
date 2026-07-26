import { useCookie, useRuntimeConfig, useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import { useFireUXConfig } from '../FireUXConfig'

export type ConsoleAppMode = 'tenant' | 'global' | 'standalone'
export type ConsoleSource = 'live' | 'test' | 'demo'
export type ConsoleFamilyConfig = {
  canCreate?: boolean
  targetIds?: string[]
  devTargetIds?: string[]
}
export type ConsoleConfig = Record<string, ConsoleFamilyConfig>

type AnyRecord = Record<string, unknown>

export function normalizeConsoleFamily(value: unknown) {
  return normalizeString(value).toLowerCase()
}

export function normalizeConsoleSource(value: unknown): ConsoleSource {
  const source = normalizeString(value).toLowerCase()
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

function fireuxRuntime(): AnyRecord {
  const pub = (useRuntimeConfig().public ?? {}) as AnyRecord
  const fireux = pub.fireux
  return fireux && typeof fireux === 'object' && !Array.isArray(fireux)
    ? (fireux as AnyRecord)
    : {}
}

function rawRecord(value: unknown): AnyRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as AnyRecord)
    : {}
}

function readConsoleConfig(): ConsoleConfig {
  const raw = rawRecord(fireuxRuntime().consoleConfig)

  return Object.fromEntries(
    Object.entries(raw)
      .map(([family, value]) => {
        const key = normalizeConsoleFamily(family)
        const cfg = rawRecord(value)
        if (!key || !Object.keys(cfg).length) return null

        const targetIds = uniqueStrings(cfg.targetIds)
        const devTargetIds = uniqueStrings(cfg.devTargetIds)

        return [
          key,
          {
            ...(typeof cfg.canCreate === 'boolean'
              ? { canCreate: cfg.canCreate }
              : {}),
            ...(targetIds.length ? { targetIds } : {}),
            ...(devTargetIds.length ? { devTargetIds } : {}),
          },
        ] as const
      })
      .filter(
        (entry): entry is readonly [string, ConsoleFamilyConfig] =>
          Boolean(entry)
      )
  )
}

export function useConsole(family = '') {
  const fireux = useFireUXConfig()
  const normalizedFamily = normalizeConsoleFamily(family)
  const sourceCookie = normalizedFamily
    ? useCookie<ConsoleSource>(
        `fireux-console-${normalizedFamily}-source`,
        {
          default: () => 'live',
          sameSite: 'lax',
        }
      )
    : ref<ConsoleSource>('live')
  const sourceState = normalizedFamily
    ? useState<ConsoleSource>(
        `fireux-console-${normalizedFamily}-source-state`,
        () => normalizeConsoleSource(sourceCookie.value)
      )
    : ref<ConsoleSource>('live')
  watch(sourceCookie, (value) => {
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
  const config = readConsoleConfig()
  const families = uniqueStrings(fireuxRuntime().consoles)

  const configFor = (targetFamily = family) => {
    const key = normalizeConsoleFamily(targetFamily)
    return key ? config[key] : undefined
  }

  const canCreateTarget = (targetFamily = family) => {
    const key = normalizeConsoleFamily(targetFamily)
    if (key === normalizedFamily && readOnly.value) return false

    const cfg = configFor(targetFamily)
    if (typeof cfg?.canCreate === 'boolean') return cfg.canCreate

    return !fireux.isTenant
  }

  const targetIds = (targetFamily = family) => {
    const cfg = configFor(targetFamily)
    return uniqueStrings(cfg?.targetIds)
  }
  const devTargetIds = (targetFamily = family) => {
    const cfg = configFor(targetFamily)
    return import.meta.dev ? uniqueStrings(cfg?.devTargetIds) : []
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
    targetIds,
    devTargetIds,
    setSource,
    resetSource,
  }
}
