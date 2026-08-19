import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import {
  BlogPostStorage,
  type BlogPost,
} from '../../../../../models/blogPost.model'
import { isBlogPostInRuntimeScope } from '../utils/blogScope'

const timestampToMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'string') return new Date(value).getTime()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'object' && value !== null) {
    const seconds = Number((value as { seconds?: unknown }).seconds ?? 0)
    const nanoseconds = Number((value as { nanoseconds?: unknown }).nanoseconds ?? 0)
    return seconds * 1000 + Math.floor(nanoseconds / 1_000_000)
  }
  return 0
}

export function useBlogCollection() {
  const fireux = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<BlogPost>(BlogPostStorage.collection)

  const collection = computed(() => {
    const posts = (source.value ?? []).filter(post =>
      isBlogPostInRuntimeScope(post, fireux)
    )
    return posts.slice().sort((a, b) => {
      const createdA = timestampToMillis(a.created?.at)
      const createdB = timestampToMillis(b.created?.at)
      return createdB - createdA
    })
  })
  const count = computed(() => collection.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return { collection, count, pending, error, outcome }
}
