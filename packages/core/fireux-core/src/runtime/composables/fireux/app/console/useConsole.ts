import { useCookie, useRuntimeConfig } from '#imports'
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import { useFireUXConfig } from '../FireUXConfig'

export type ConsoleAppMode = 'tenant' | 'global' | 'standalone'
export type ConsoleFamilyConfig = {
  canCreate?: boolean
  targetIds?: string[]
}
export type ConsoleConfig = Record<string, ConsoleFamilyConfig>

type ConsoleState = {
  selectedId: string
}

type ValueRef<T> = Ref<T> | ComputedRef<T>
type AnyRecord = Record<string, unknown>

type UseConsoleOptions<TTarget> = {
  targetItems?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetPending?: ValueRef<boolean | null | undefined>
  getId?: (item: TTarget) => string
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null
const defaultConsoleState = (): ConsoleState => ({
  selectedId: '',
})

function consoleFamily(value: unknown) {
  return normalizeString(value).toLowerCase()
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

function stringList(value: unknown): string[] {
  return uniqueStrings(value)
}

function readConsoleConfig(): ConsoleConfig {
  const raw = rawRecord(fireuxRuntime().consoleConfig)

  return Object.fromEntries(
    Object.entries(raw)
      .map(([family, value]) => {
        const key = consoleFamily(family)
        const cfg = rawRecord(value)
        if (!key || !Object.keys(cfg).length) return null

        const targetIds = stringList(cfg.targetIds)

        return [
          key,
          {
            ...(typeof cfg.canCreate === 'boolean'
              ? { canCreate: cfg.canCreate }
              : {}),
            ...(targetIds.length ? { targetIds } : {}),
          },
        ] as const
      })
      .filter(
        (entry): entry is readonly [string, ConsoleFamilyConfig] =>
          Boolean(entry)
      )
  )
}

export function useConsoleFamilies() {
  const families = stringList(fireuxRuntime().consoles)

  return {
    families,
  }
}

export function useConsoleConfig(family = '') {
  const fireux = useFireUXConfig()
  const config = readConsoleConfig()

  const configFor = (targetFamily = family) => {
    const key = consoleFamily(targetFamily)
    return key ? config[key] : undefined
  }

  const canCreateTarget = (targetFamily = family) => {
    const cfg = configFor(targetFamily)
    if (typeof cfg?.canCreate === 'boolean') return cfg.canCreate

    return !fireux.isTenant
  }

  const targetIds = (targetFamily = family) => {
    const cfg = configFor(targetFamily)
    return Array.isArray(cfg?.targetIds) ? cfg.targetIds : []
  }

  return {
    config,
    canCreateTarget,
    targetIds,
  }
}

export function useConsole<TTarget = never>(
  family: string,
  options?: UseConsoleOptions<TTarget>
) {
  const fireux = useFireUXConfig()
  const normalizedFamily = consoleFamily(family)
  const appMode: ConsoleAppMode = fireux.isTenant
    ? 'tenant'
    : fireux.isStandalone
      ? 'standalone'
      : 'global'
  const appContext = {
    appId: fireux.appId,
    ecosystem: fireux.ecosystem,
    role: fireux.role,
    mode: appMode,
    isTenant: appMode === 'tenant',
    isGlobal: appMode === 'global',
    isStandalone: appMode === 'standalone',
  }
  const state = useCookie<ConsoleState>(`fireux-console-${normalizedFamily}`, {
    default: defaultConsoleState,
    sameSite: 'lax',
  })

  const selectedId = computed(() => normalizeString(state.value?.selectedId))
  const targetItems = computed<TTarget[]>(() => {
    const items = options?.targetItems ? unref(options.targetItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const targetPending = computed(() =>
    options?.targetPending ? Boolean(unref(options.targetPending)) : false
  )

  const selectEntity = (id: string) => {
    state.value = {
      selectedId: normalizeString(id),
    }
  }

  const clearSelection = () => {
    state.value = {
      selectedId: '',
    }
  }

  const getEntityId = (item: TTarget | null | undefined) => {
    if (!item || !options?.getId) return ''
    return normalizeString(options.getId(item))
  }

  const selectedEntity = computed<TTarget | null>(() => {
    const id = selectedId.value
    if (!id || !options?.getId) return null

    return targetItems.value.find((item) => getEntityId(item) === id) ?? null
  })

  if (options?.targetItems && options.getId) {
    watch(
      () => ({
        id: selectedId.value,
        items: targetItems.value,
        pending: targetPending.value,
      }),
      (state: { id: string; items: TTarget[]; pending: boolean }) => {
        const { id, items, pending } = state
        if (!id || pending) return
        if (!items.length) return
        if (items.some((item) => getEntityId(item) === id)) return
        clearSelection()
      },
      { immediate: true }
    )
  }

  return {
    family: normalizedFamily,
    appContext,
    selectedId,
    selectedEntity,
    selectEntity,
    clearSelection,
  }
}
