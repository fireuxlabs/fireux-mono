import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { computed, watchEffect } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import {
  readPlaceIdentity,
  placeIdentityFields,
} from 'fireux-places/runtime/place/models/identity-edit'
import { useKitchenIdentityProjection } from '../useKitchenIdentity'
import { useKitchenUpdate } from '../firestore/useKitchenUpdate'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspace } from './useKitchenWorkspace'
import {
  kitchenIdentityPurpose,
  kitchenIdentityBoundary,
} from '../../models/identity-intent'
export function useKitchenWorkspaceIdentity() {
  const workspace = useKitchenWorkspace()
  const { currentUser } = useAuth()
  const updater = useKitchenUpdate()
  const state = {
    ...useKitchenIdentityProjection(workspace),
    canWrite: computed(
      () =>
        Boolean(currentUser.value && workspace.data.value) &&
        workspace.outcome.value === 'ready'
    ),
    update: (changes: Parameters<typeof updater.updateKitchen>[0]['changes']) =>
      updater.updateKitchen({ kitchenId: workspace.id.value, changes }),
  }
  const { appId } = useFireUXConfig()
  const fields = computed(() => readPlaceIdentity(state.place.value))
  const status = computed(() => {
    if (
      !state.kitchenId.value ||
      state.outcome.value === 'idle' ||
      state.outcome.value === 'empty'
    )
      return 'empty'
    if (state.outcome.value === 'error' || state.placeOutcome.value === 'error')
      return 'error'
    if (state.outcome.value === 'pending') return 'pending'
    if (state.outcome.value === 'missing') return 'missing'
    if (state.pending.value) return 'pending'
    return state.placeOutcome.value === 'ready' && state.place.value
      ? 'ready'
      : 'missing'
  })
  const { canWrite, availableActions, scopeKey, readState } =
    useWorkspaceIdentity({
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

export type KitchenWorkspaceIdentityState = ReturnType<
  typeof useKitchenWorkspaceIdentity
>
