import {
  collection,
  query as firestoreQuery,
  where,
  type DocumentData,
  type Firestore,
  type Query,
} from 'firebase/firestore'
import { computed, type ComputedRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'

type AppSupportAccessQueryOptions = {
  db: Firestore
  appId: ComputedRef<string>
  collectionName: string
  accessId: ComputedRef<string>
  enabled: ComputedRef<boolean>
}

export function useAppSupportAccessQueries<TRecord extends DocumentData>(
  options: AppSupportAccessQueryOptions
) {
  const collectionPath = computed(() =>
    options.appId.value
      ? `${'apps'}/${options.appId.value}/${options.collectionName}`
      : ''
  )

  function accessQuery(field: 'operator_ids' | 'team_ids') {
    return computed<Query<TRecord> | null>(() => {
      if (
        !options.enabled.value ||
        !options.appId.value ||
        !options.accessId.value
      ) {
        return null
      }

      return firestoreQuery(
        collection(
          options.db,
          'apps',
          options.appId.value,
          options.collectionName
        ),
        where(field, 'array-contains', options.accessId.value)
      ) as Query<TRecord>
    })
  }

  return {
    collectionPath,
    operatorQuery: accessQuery('operator_ids'),
    teamQuery: accessQuery('team_ids'),
  }
}

export function useAppSupportAccess(options: AppSupportAccessQueryOptions) {
  const queries = useAppSupportAccessQueries<DocumentData>(options)
  const { firestoreQuery } = useFirestoreRead()
  const operatorRecords = firestoreQuery(queries.operatorQuery)
  const teamRecords = firestoreQuery(queries.teamQuery)
  const ids = computed(() => [
    ...new Set(
      [...(operatorRecords.value ?? []), ...(teamRecords.value ?? [])]
        .map((record) => String(record.id ?? '').trim())
        .filter(Boolean)
    ),
  ])
  const pending = computed(
    () => operatorRecords.pending.value || teamRecords.pending.value
  )
  const error = computed(
    () => operatorRecords.error.value ?? teamRecords.error.value
  )
  const { outcome } = useFirestoreCollectionState({
    active: options.enabled,
    count: computed(() => ids.value.length),
    pending,
    error,
  })

  return { ids, pending, error, outcome }
}
