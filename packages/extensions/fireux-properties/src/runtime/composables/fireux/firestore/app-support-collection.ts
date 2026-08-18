import {
  collection,
  query as firestoreQuery,
  where,
  type DocumentData,
  type Firestore,
  type Query,
} from 'firebase/firestore'
import { computed, type ComputedRef } from 'vue'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'

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
      ? `${AppStorage.collection}/${options.appId.value}/${options.collectionName}`
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
          AppStorage.collection,
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
