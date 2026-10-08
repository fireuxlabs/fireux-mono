import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { computed, watchEffect } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  readPlaceIdentity,
  placeIdentityFields,
} from 'fireux-places/runtime/place/models/identity-edit'
import { useKitchenWorkspacePlace } from './useKitchenWorkspacePlace'
import {
  kitchenIdentityPurpose,
  kitchenIdentityBoundary,
} from '../../../models/identity-intent'
export function useKitchenIdentity() {
  const state = useKitchenWorkspacePlace()
  const { appId } = useFireUXConfig()
  const fields = computed(() => readPlaceIdentity(state.place.value))
  const status = computed(() => {
    if (state.outcome.value === 'pending') return 'pending'
    if (state.outcome.value === 'error') return 'error'
    if (!state.kitchenId.value) return 'empty'
    if (state.pending.value) return 'pending'
    if (state.placeOutcome.value === 'error') return 'error'
    return state.place.value ? 'ready' : 'missing'
  })
  const { canWrite, availableActions, scopeKey, readState } = useIdentity({
    id: state.kitchenId,
    fields,
    status,
    canWrite: state.canWrite,
  })
  const canWriteKitchen = computed(
    () => state.outcome.value === 'ready' && state.canWrite.value
  )
  const mutationAuthority = computed(() => ({
    appId,
    kitchenId: state.kitchenId.value,
  }))
  const intro = computed(() => ({
    id: 'kitchen.identity',
    title: 'Kitchen Identity',
    purpose: kitchenIdentityPurpose,
    data: placeIdentityFields.map((field) => field.label).join(', ') + '.',
    boundaries: kitchenIdentityBoundary,
    ai: 'AI prepares this same venue editor. Review and save changes yourself.',
    status: status.value,
    tools: [
      {
        id: 'read',
        label: 'Read venue identity',
        description: 'View your Kitchen’s current public identity.',
        available: availableActions.value.includes('read'),
      },
      {
        id: 'update',
        label: 'Edit venue identity',
        description:
          'Review and save your changes. Other fields remain unchanged; optional fields can be cleared.',
        available: canWrite.value,
      },
    ],
  }))
  const page = useWorkspacePageState('kitchen')
  watchEffect(() =>
    page.publish({
      identity: { placeId: state.placeId.value, ...fields.value },
      derived: {
        status: status.value,
        availableActions: availableActions.value,
      },
    })
  )
  return {
    ...state,
    fields,
    status,
    readState,
    canWrite,
    canWriteKitchen,
    availableActions,
    mutationAuthority,
    scopeKey,
    intro,
  }
}
