import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { collection as firestoreCollection, query, where } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { BlogPostStorage, type BlogPost } from '../utils/blog-post'
import { isBlogPostInRuntimeScope } from './firestore/utils/blogScope'
import { normalizeBlogPost } from '../utils/normalize-blog-post'

const timestampToMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'string') return new Date(value).getTime()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'object' && value !== null) {
    const seconds = Number((value as { seconds?: unknown }).seconds ?? 0)
    const nanoseconds = Number(
      (value as { nanoseconds?: unknown }).nanoseconds ?? 0
    )
    return seconds * 1000 + Math.floor(nanoseconds / 1_000_000)
  }
  return 0
}

export function useBlogCollection() {
  const fireux = useFireUXConfig()
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  // This is the authoring collection; public discovery uses useBlogDirectory.
  // Scope the query before Rules evaluate it, rather than filtering other Apps afterwards.
  const scopedQuery = computed(() => fireux.appId
    ? query(firestoreCollection(db, BlogPostStorage.collection), where('source_app_id', '==', fireux.appId))
    : null)
  const source = firestoreQuery<Record<string, unknown>>(scopedQuery, `blogs:authoring:${fireux.appId}`, BlogPostStorage.collection)

  const collection = computed(() => {
    const posts = (source.value ?? [])
      .map((post) => normalizeBlogPost(post.id || post.slug, post))
      .filter((post): post is BlogPost => Boolean(post))
      .filter((post) => isBlogPostInRuntimeScope(post, fireux))
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
