import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenCreate } from '../firestore/useKitchenCreate'
import { useKitchenDelete } from '../firestore/useKitchenDelete'
import { useKitchenUpdate } from '../firestore/useKitchenUpdate'
import { useKitchenRead } from '../firestore/useKitchenRead'
import { computed } from 'vue'
import { useKitchenAccess } from '../useKitchenAccess'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import { resolveKitchenAllowance } from '../../utils/kitchen-capacity'

export function useKitchenWorkspace() {
  const { selectedId: id } = useWorkspace('kitchen')
  const creation = useKitchenCreate()
  const update = useKitchenUpdate()
  const removal = useKitchenDelete()
  const { kitchen: data, outcome } = useKitchenRead(id)
  const session = useAppSession()
  const config = useFireUXConfig()
  const access = useKitchenAccess()
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
      create: creation.createKitchen,
      update: (
        changes: Parameters<typeof update.updateKitchen>[0]['changes']
      ) => update.updateKitchen({ kitchenId: id.value, changes }),
      delete: () => removal.deleteKitchen(id.value),
    },
  }
}
