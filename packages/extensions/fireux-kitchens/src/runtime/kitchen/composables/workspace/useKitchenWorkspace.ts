import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import { useKitchenAnonymousAdoption } from './useKitchenAnonymousAdoption'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useKitchenUpdate } from '../firestore/useKitchenUpdate'
import { useKitchenInterface } from '../useKitchenInterface'
import { useKitchenRead } from '../firestore/useKitchenRead'
import { computed } from 'vue'
import { useKitchenAccess } from '../useKitchenAccess'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/workspace/utils/policy'
import { resolveKitchenAllowance } from '../../utils/kitchen-capacity'

export function useKitchenWorkspace() {
  const adoption = useKitchenAnonymousAdoption()
  const { selectedId: id } = useWorkspace('kitchen')
  const update = useKitchenUpdate([id])
  const access = useKitchenAccess()
  const readId = computed(() => access.outcome.value === 'ready' && access.ids.value.includes(id.value) ? id.value : '')
  const source = useKitchenRead(readId)
  const { kitchen, place } = source
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && kitchen.value?.id !== readId.value) return 'pending'
    return source.outcome.value
  })
  const { surface } = useKitchenInterface()
  const data = computed(() =>
    outcome.value === 'ready' && kitchen.value?.id === readId.value
      ? surface({ kitchen: kitchen.value, place: place.value, routeScope: 'live' })
      : null
  )
  const session = useAppSession()
  const config = useFireUXConfig()
  const allowance = computed(() =>
    resolveKitchenAllowance(session.appUser.value, access.ids.value)
  )
  const ready = computed(
    () =>
      Boolean(session.uid.value) &&
      !session.pending.value &&
      !session.error.value &&
      !access.pending.value &&
      !access.error.value
  )
  const canAdd = computed(() => ready.value && allowance.value.canAdd)
  const creationEnabled = computed(() =>
    resolveWorkspaceCanCreate(config.role, config.workspaceConfig, 'kitchen')
  )
  const canCreate = computed(() => canAdd.value && creationEnabled.value)
  const showUpgrade = computed(
    () => creationEnabled.value && ready.value && allowance.value.showUpgrade
  )

  return {
    adoption,
    data,
    id,
    outcome,
    allowance,
    accountReady: computed(
      () =>
        !session.pending.value &&
        !session.error.value &&
        !access.pending.value &&
        !access.error.value
    ),
    hasAccount: computed(() =>
      Boolean(session.uid.value && session.appUser.value)
    ),
    creationEnabled,
    canAdd,
    canCreate,
    showUpgrade,
    crud: {
      update: (
        changes: Parameters<typeof update.updateKitchen>[0]['changes']
      ) => update.updateKitchen({ kitchenId: id.value, changes }),
    },
  }
}
