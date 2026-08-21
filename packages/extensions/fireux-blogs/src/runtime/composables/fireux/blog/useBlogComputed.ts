import { computed, type Ref } from 'vue'
import type { BlogPost } from '../../../models/blogPost.model'

export function useBlogComputed(post?: Ref<BlogPost | null | undefined>) {
  const hasPost = computed(() => Boolean(post?.value?.id || post?.value?.slug))
  const hasMissingTitle = computed(
    () => !String(post?.value?.title || '').trim()
  )
  const hasMissingSlug = computed(() => !String(post?.value?.slug || '').trim())
  const isPublished = computed(() => post?.value?.visibility === 'public')
  const isDraft = computed(() => !isPublished.value)
  const displayStatus = computed(() =>
    isPublished.value ? 'Published' : 'Draft'
  )
  const blogTitle = computed(() =>
    String(
      post?.value?.title || post?.value?.slug || post?.value?.id || ''
    ).trim()
  )

  return {
    hasPost,
    hasMissingTitle,
    hasMissingSlug,
    isPublished,
    isDraft,
    displayStatus,
    blogTitle,
  }
}
