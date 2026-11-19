import { useWorkspaceRecord } from 'fireux-core/runtime/workspace/composables/useWorkspaceRecord'
import { useWorkspaceSwitch } from 'fireux-core/runtime/workspace/composables/useWorkspaceSwitch'
import { computed, watch } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { usePropertyCollection } from '../usePropertyCollection'
import { usePropertyAccess } from '../usePropertyAccess'
import { usePropertyFetch } from '../firestore/fetch/usePropertyFetch'

export const usePropertyWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('property')
  const id = selection.selectedId
  const access = usePropertyAccess()
  const { properties: collection, outcome: propertiesOutcome } =
    usePropertyCollection({
      filter: computed(() => ({ ids: access.ids.value })),
    })
  const collectionOutcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : propertiesOutcome.value
  )
  watch(
    [collection, collectionOutcome, id],
    () =>
      selection.reconcile(
        collection.value.flatMap((property) =>
          property.id ? [property.id] : []
        ),
        collectionOutcome.value
      ),
    { immediate: true }
  )

  const { data, outcome } = useWorkspaceRecord(
    id,
    access,
    usePropertyFetch,
    (source) => source.property
  )

  return {
    data,
    id,
    outcome,
    collectionOutcome,
    collection,
    select: useWorkspaceSwitch('property', selection, {
      collection,
      collectionOutcome,
      access,
      session: useAppSession(),
    }),
  }
})
