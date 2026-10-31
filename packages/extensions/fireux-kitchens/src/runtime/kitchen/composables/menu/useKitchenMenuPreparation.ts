import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useKitchenAccess } from '../useKitchenAccess'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../menu/utils/menu-source-upload'

/** One scoped source and processing context, independent of purchase or route. */
export function useKitchenMenuPreparation(input: {
  kitchenId: MaybeRefOrGetter<string>
  sourceId: MaybeRefOrGetter<string>
}) {
  const access = useKitchenAccess(),
    config = useFireUXConfig()
  const kitchenId = computed(() => toValue(input.kitchenId)),
    sourceId = computed(() => toValue(input.sourceId))
  const allowed = computed(
    () =>
      access.outcome.value === 'ready' &&
      access.ids.value.includes(kitchenId.value)
  )
  const path = computed(() =>
    allowed.value && sourceId.value
      ? `kitchens/${kitchenId.value}/${MenuSourceUploadStorage.collection}`
      : ''
  )
  const read = useFirestoreRead().firestoreFetchDoc<MenuSourceUpload>(
    path,
    sourceId
  )
  const outcome = computed(() =>
    access.outcome.value !== 'ready'
      ? access.outcome.value
      : !kitchenId.value || !sourceId.value
        ? 'idle'
        : !allowed.value
          ? 'empty'
          : read.outcome.value
  )
  const source = computed(() =>
    outcome.value === 'ready' ? (read.value ?? null) : null
  )
  return {
    outcome,
    error: computed(() => access.error.value || read.error.value),
    context: {
      menu: computed(() => null),
      source,
      menuId: sourceId,
      kitchenId,
      activeKitchenAppId: computed(() => config.appId),
      canWrite: computed(() => allowed.value && outcome.value === 'ready'),
    },
  }
}
