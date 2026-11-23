import { useWorkspaceRecord } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceRecord'
import { useWorkspaceSwitch } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceSwitch'
import { computed, watch } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/membership/access'
import { useState, useRoute, navigateTo } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-workspace/runtime/workspace/composables/useWorkspace'
import { useKitchenCollection } from '../useKitchenCollection'
import { useWorkspaceEntryCta } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceEntryCta'
import { useKitchenRead } from '../useKitchenRead'

export const useKitchenWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('kitchen')
  const id = selection.selectedId
  const {
    kitchens: collection,
    outcome: collectionOutcome,
    error: collectionError,
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
    const requested = requestedId.value
    if (requested && ids.includes(requested)) {
      selection.select(requested)
      const query = { ...route.query }
      delete query.kitchenId
      void navigateTo(
        { path: route.path, query, hash: route.hash },
        { replace: true }
      )
      return true
    }

    const adopted = adoptedSelection.value
    if (!ids.includes(adopted)) return false
    selection.select(adopted)
    adoptedSelection.value = ''
    return true
  }

  watch(
    [collection, collectionOutcome, id, adoptedSelection, requestedId],
    () => {
      const ids = collection.value.flatMap((kitchen) =>
        kitchen.id ? [kitchen.id] : []
      )
      if (applyEntrySelection(ids)) return
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
  const data = computed(() => {
    const record = kitchen.value
    if (!record || record.name !== record.id) return record
    const name = collection.value.find(({ id }) => id === record.id)?.name
    return name ? { ...record, name } : record
  })

  // Subscription changes presentation only. Selection uses the full collection.
  const multipleKitchenView = computed(
    () =>
      !session.pending.value &&
      !session.error.value &&
      resolveAppUserAccess(session.appUser.value).hasBusinessSubscription
  )

  return {
    data,
    root: computed(() =>
      readId.value && source.root.value?.id === readId.value
        ? source.root.value
        : null
    ),
    place: computed(() => (outcome.value === 'ready' ? place.value : null)),
    placeOutcome: computed(() =>
      outcome.value === 'ready' ? source.placeOutcome.value : outcome.value
    ),
    id,
    outcome,
    collection,
    multipleKitchenView,
    collectionOutcome,
    error: computed(() => collectionError.value ?? source.error.value),
    select: useWorkspaceSwitch('kitchen', selection, {
      collection,
      collectionOutcome,
      access,
      session,
      homePath: workspaceEntryPath,
    }),
  }
})
