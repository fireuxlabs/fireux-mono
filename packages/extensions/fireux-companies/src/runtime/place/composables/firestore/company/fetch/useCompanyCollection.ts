import { useAsyncData } from '#imports'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  COMPANY_DIRECTORY_MAX_PAGE_SIZE,
  type CompanyDirectoryEntry,
  type CompanyDirectoryPage,
} from '../../../../models/company-directory.model.ts'
import { CompanyStorage } from '../../../../models/company.model.ts'

export type UseCompanyCollectionReturn<T> = {
  collectionPath: ComputedRef<string>
  collection: ComputedRef<T[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
  refresh: () => Promise<void>
  ready: Promise<void>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

export function useCompanyCollection<
  T extends Record<string, any> = Record<string, any>,
>(
  _collectionPath: string = CompanyStorage.collection
): UseCompanyCollectionReturn<T> {
  const collectionPath = computed(() => CompanyStorage.collection)
  const state = useAsyncData<CompanyDirectoryPage>(
    `company-directory|limit=${COMPANY_DIRECTORY_MAX_PAGE_SIZE}`,
    () =>
      $fetch<CompanyDirectoryPage>(
        `/api/companies?limit=${COMPANY_DIRECTORY_MAX_PAGE_SIZE}`
      )
  )
  const collection = computed<T[]>(
    () => (state.data.value?.items ?? []) as unknown as T[]
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const nextCursor = computed(() => state.data.value?.nextCursor ?? '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const count = computed(() => collection.value.length)
  const pending = computed(() => state.pending.value)
  const error = computed<unknown | undefined>(
    () => state.error.value ?? undefined
  )
  const { outcome } = useFirestoreCollectionState({ count, error, pending })

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const page = await $fetch<CompanyDirectoryPage>(
        `/api/companies?limit=${COMPANY_DIRECTORY_MAX_PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      )
      const current = state.data.value
      if (!current) return false

      const items = new Map<string, CompanyDirectoryEntry>(
        current.items.map((item: CompanyDirectoryEntry) => [item.id, item])
      )
      for (const item of page.items) items.set(item.id, item)
      state.data.value = {
        items: [...items.values()],
        ...(page.nextCursor ? { nextCursor: page.nextCursor } : {}),
      }
      return true
    } catch (error) {
      loadMoreError.value = error
      return false
    } finally {
      loadingMore.value = false
    }
  }

  return {
    collectionPath,
    collection,
    count,
    pending,
    error,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}
