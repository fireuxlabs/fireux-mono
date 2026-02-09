import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { BlogPost } from '../../../../../../models/blogPost.model'

export function useBlogCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<BlogPost>('blogs')

  const collection = computed(() => source.value ?? [])
  const count = computed(() => collection.value.length)

  return { collection, count }
}
