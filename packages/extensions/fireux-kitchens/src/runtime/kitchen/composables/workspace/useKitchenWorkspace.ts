import { useWorkspaceRecord } from 'fireux-core/runtime/workspace/composables/useWorkspaceRecord'
import { useWorkspaceSwitch } from 'fireux-core/runtime/workspace/composables/useWorkspaceSwitch'
import { computed, watch } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/app-user/utils/access'
import { useState, useRoute, navigateTo } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useKitchenCollection } from '../useKitchenCollection'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { useKitchenInterface } from '../useKitchenInterface'
import { useKitchenRead } from '../useKitchenRead'

export const useKitchenWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('kitchen')
  const id = selection.selectedId
  const {
    kitchens: collection,
    outcome: collectionOutcome,
    access,
  } = useKitchenCollection()
  const session = useAppSession()
  const { appId } = useFireUXConfig()
  const adoptedSelection = useState(
    `kitchen-adopted-selection:${appId}`,
    () => ''
  )
  const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
  const route = useRoute()
  const requestedId = computed(() =>
    route.meta.workspace === 'kitchen' &&
    typeof route.query.kitchenId === 'string'
      ? route.query.kitchenId
      : ''
  )

  function applyEntrySelection(ids: readonly string[]) {
    if (collectionOutcome.value !== 'ready') return false
    if (requestedId.value && ids.includes(requestedId.value)) {
      selection.select(requestedId.value)
      const query = { ...route.query }
      delete query.kitchenId
      void navigateTo(
        { path: route.path, query, hash: route.hash },
        { replace: true }
      )
      return true
    }
    if (!ids.includes(adoptedSelection.value)) return false
    selection.select(adoptedSelection.value)
    adoptedSelection.value = ''
    return true
  }

  watch(
    [collection, collectionOutcome, id, adoptedSelection, requestedId],
    () => {
      const ids = collection.value.flatMap((kitchen) =>
        kitchen.id ? [kitchen.id] : []
      )
      if (!applyEntrySelection(ids))
        selection.reconcile(ids, collectionOutcome.value)
    },
    { immediate: true }
  )

  const {
    data: kitchen,
    outcome,
    readId,
    source,
  } = useWorkspaceRecord(id, access, useKitchenRead, (source) => source.kitchen)
  const { place } = source
  const { surface } = useKitchenInterface()
  const data = computed(() =>
    kitchen.value
      ? surface({
          kitchen: kitchen.value,
          place: place.value,
          routeScope: 'live',
        })
      : null
  )

  // Subscription changes presentation only. Selection uses the full collection.
  const multipleKitchenView = computed(
    () =>
      !session.pending.value &&
      !session.error.value &&
      resolveAppUserAccess(session.appUser.value).hasBusinessSubscription
  )

  return {
    data,
    kitchenName: computed(() => data.value?.name || ''),
    root: computed(() =>
      readId.value && source.root.value?.id === readId.value
        ? source.root.value
        : null
    ),
    place: computed(() =>
      outcome.value === 'ready' && place.value?.id === readId.value
        ? place.value
        : null
    ),
    placeOutcome: computed(() =>
      outcome.value === 'ready' ? source.placeOutcome.value : outcome.value
    ),
    id,
    outcome,
    collection,
    multipleKitchenView,
    collectionOutcome,
    select: useWorkspaceSwitch('kitchen', selection, {
      collection,
      collectionOutcome,
      access,
      session,
      homePath: workspaceEntryPath,
    }),
  }
})
