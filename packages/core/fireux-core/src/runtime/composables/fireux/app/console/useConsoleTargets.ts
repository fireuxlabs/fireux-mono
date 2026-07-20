// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt current-user console targeting into app membership reads only.
// Concurrent edit — 2026-07-20 16:20 CEST — Console Spine pass: preserve App membership errors in target outcomes.
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useAuth } from '../../firebase/useAuth'
import { useUserFetch } from '../../firestore/core/user/fetch/useUserFetch'
import { resolveUserAppConsoleTargetField } from '../../../../models/core/user.model'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import {
  normalizeConsoleFamily,
  useConsole,
  type ConsoleAppMode,
} from './useConsole'
import type { ConsoleTargetOutcome } from './useConsoleIndex'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleTargetsOptions = {
  family: string
  globalTargetIds?: ValueRef<unknown[] | null | undefined>
}

type ConsoleTargetFilter = Record<string, unknown>

export function useConsoleTargets(options: UseConsoleTargetsOptions) {
  const family = normalizeConsoleFamily(options.family)
  const consoleRoot = useConsole(options.family)
  const { uid } = useAuth()
  const mode: ConsoleAppMode = consoleRoot.mode
  const membershipUid = computed(() => mode === 'tenant' ? null : uid.value)
  const {
    appUser,
    appPending: membershipPending,
    appError: membershipError,
  } = useUserFetch(membershipUid, { app: true })
  const configTargetIds = uniqueStrings(consoleRoot.targetIds())
  const configDevTargetIds = uniqueStrings(consoleRoot.devTargetIds())
  const appUserTargetField = resolveUserAppConsoleTargetField(family)
  const appUserTargetIds = computed(() =>
    uniqueStrings(
      appUserTargetField
        ? appUser.value?.console_targets?.[appUserTargetField]
        : []
    )
  )
  const globalTargetIds = computed(() =>
    uniqueStrings(options.globalTargetIds ? unref(options.globalTargetIds) : [])
  )
  const targetIds = computed(() => {
    if (mode === 'tenant') return configTargetIds

    return uniqueStrings([
      ...appUserTargetIds.value,
      ...globalTargetIds.value,
      ...configDevTargetIds,
    ])
  })
  const canCreate = computed(() => consoleRoot.canCreateTarget())
  const isTenant = mode === 'tenant'
  const isSingleTarget = computed(() => targetIds.value.length === 1)
  const isSingleTenantTarget = computed(() => isTenant && isSingleTarget.value)
  const singleTargetId = computed(() =>
    isSingleTarget.value ? targetIds.value[0] ?? '' : ''
  )
  const filter = <TFilter extends ConsoleTargetFilter>(base: TFilter) => ({
    ...base,
    ids: targetIds.value,
  })
  const pending = computed(() =>
    mode === 'tenant' ? false : Boolean(membershipPending.value)
  )
  const error = computed<unknown>(() =>
    mode === 'tenant' ? null : membershipError.value
  )
  const resolveOutcome = (sourceOutcome: ValueRef<ConsoleTargetOutcome>) =>
    computed<ConsoleTargetOutcome>(() => {
      if (pending.value) return 'pending'
      if (error.value) return 'error'
      return unref(sourceOutcome)
    })
  const debug = computed(() => ({
    family: normalizeString(family),
    appMode: mode,
    configTargetIds,
    configDevTargetIds,
    appUserTargetField,
    appUserTargetIds: appUserTargetIds.value,
    globalTargetIds: globalTargetIds.value,
    targetIds: targetIds.value,
    membershipPending: pending.value,
    membershipError: error.value,
    canCreate: canCreate.value,
    isSingleTarget: isSingleTarget.value,
    isSingleTenantTarget: isSingleTenantTarget.value,
  }))

  return {
    console: consoleRoot,
    mode,
    isTenant,
    isGlobal: mode === 'global',
    isStandalone: mode === 'standalone',
    configTargetIds,
    configDevTargetIds,
    appUserTargetField,
    appUserTargetIds,
    globalTargetIds,
    targetIds,
    canCreate,
    isSingleTarget,
    isSingleTenantTarget,
    singleTargetId,
    filter,
    pending,
    error,
    resolveOutcome,
    debug,
  }
}
