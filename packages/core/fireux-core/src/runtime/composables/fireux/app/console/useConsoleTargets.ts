import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useAuth } from '../../firebase/useAuth'
import { useUserFetch } from '../../firestore/core/user/fetch/useUserFetch'
import { resolveAppUserConsoleTargetField } from '../../../../models/core/user.model'
import { normalizeString, uniqueStrings } from '../../../../utils/string'
import {
  normalizeConsoleFamily,
  useConsole,
  type ConsoleAppMode,
} from './useConsole'

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
  const { appUser, pending: userPending } = useUserFetch(uid)
  const mode: ConsoleAppMode = consoleRoot.mode
  const configTargetIds = uniqueStrings(consoleRoot.targetIds())
  const configDevTargetIds = uniqueStrings(consoleRoot.devTargetIds())
  const appUserTargetField = resolveAppUserConsoleTargetField(family)
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
  const canCreate = consoleRoot.canCreateTarget()
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
  const debug = computed(() => ({
    family: normalizeString(family),
    appMode: mode,
    configTargetIds,
    configDevTargetIds,
    appUserTargetField,
    appUserTargetIds: appUserTargetIds.value,
    globalTargetIds: globalTargetIds.value,
    targetIds: targetIds.value,
    userPending: userPending.value,
    canCreate,
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
    pending: userPending,
    debug,
  }
}
