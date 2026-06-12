import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleConfig } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useKitchenConsoleList } from './useKitchenConsoleList'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

type KitchenConsoleTargetSourceName = 'tenant-config' | 'user-kitchens'

const normalize = (value: unknown) => String(value ?? '').trim()
const uniqueStrings = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => normalize(value)).filter(Boolean)))

/**
 * Kitchen console target source policy.
 *
 * Tenant apps use configured Kitchen ids.
 * Global apps use the signed-in user's Kitchen index.
 */
export function useKitchenConsoleTargetSource() {
  const fireux = useFireUXConfig()
  const consoleConfig = useConsoleConfig('kitchen')
  const { coreUser, pending: userPending } = useUser()

  const configKitchenIds = computed(() =>
    uniqueStrings(consoleConfig.targetIds())
  )
  const myKitchenIds = computed(() =>
    Array.isArray(coreUser.value?.myKitchens)
      ? uniqueStrings(coreUser.value.myKitchens)
      : []
  )
  const sourceName = computed<KitchenConsoleTargetSourceName>(() =>
    fireux.isTenant ? 'tenant-config' : 'user-kitchens'
  )
  const targetIds = computed(() =>
    sourceName.value === 'tenant-config'
      ? configKitchenIds.value
      : myKitchenIds.value
  )
  const list = useKitchenConsoleList({ ids: targetIds })
  const targets = computed<KitchenSurface[]>(() => list.kitchens.value)
  const count = computed(() => targets.value.length)
  const readOnly = computed(() => false)
  const canCreate = computed(() => consoleConfig.canCreateTarget())
  const pending = computed(() =>
    sourceName.value === 'user-kitchens'
      ? Boolean(userPending.value || list.pending.value)
      : list.pending.value
  )
  const autoSelectSingle = computed(
    () => sourceName.value === 'tenant-config' && count.value === 1
  )
  const label = computed(() =>
    sourceName.value === 'tenant-config' ? 'Configured Kitchen' : 'My Kitchens'
  )

  return {
    targets,
    count,
    pending,
    sourceName,
    label,
    readOnly,
    canCreate,
    autoSelectSingle,
    configKitchenIds,
    myKitchenIds,
  }
}
