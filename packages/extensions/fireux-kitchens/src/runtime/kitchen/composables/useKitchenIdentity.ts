import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { computed, watchEffect } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  readPlaceIdentity,
  placeIdentityFields,
} from 'fireux-places/runtime/place/models/identity-edit'
import { useKitchenWorkspacePlace } from './workspace/identity/useKitchenWorkspacePlace'
import {
  kitchenIdentityPurpose,
  kitchenIdentityBoundary,
} from '../models/identity-intent'
export function useKitchenIdentity() {
  const state = useKitchenWorkspacePlace()
  const { appId } = useFireUXConfig()
  const fields = computed(() => readPlaceIdentity(state.place.value))
  const status = computed(() =>
    !state.kitchenId.value
      ? 'empty'
      : state.outcome.value === 'pending' || state.pending.value
        ? 'pending'
        : state.outcome.value === 'error' ||
            state.placeOutcome.value === 'error'
          ? 'error'
          : !state.place.value
            ? 'missing'
            : 'ready'
  )
  const { canWrite, availableActions, scopeKey } = useIdentity({
    id: state.kitchenId,
    fields,
    status,
    canWrite: state.canWrite,
  })
  const mutationAuthority = computed(() => ({
    appId,
    kitchenId: state.kitchenId.value,
  }))
  const intro = computed(() => ({
    id: 'kitchen.identity',
    title: 'Kitchen Identity',
    purpose: kitchenIdentityPurpose,
    data:
      placeIdentityFields.map((field) => field.label).join(', ') +
      '. Venue details remain Place-owned.',
    boundaries: kitchenIdentityBoundary,
    ai: 'AI prepares this same venue editor. Review and save changes yourself.',
    status: status.value,
    tools: [
      {
        id: 'read',
        label: 'Read venue identity',
        description: 'View the selected Place’s current identity.',
        available: availableActions.value.includes('read'),
      },
      {
        id: 'update',
        label: 'Edit venue identity',
        description:
          'Review changed fields and save through the Place command. Omitted fields remain unchanged; optional fields can be cleared.',
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
    canWrite,
    availableActions,
    mutationAuthority,
    scopeKey,
    intro,
  }
}
