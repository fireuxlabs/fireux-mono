import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { usePublish } from 'fireux-core/runtime/composables/fireux/publishing/usePublish'
import { BlogPostStorage } from '../../../../../utils/blog-post'

export type BlogPublishInput = {
  slug: string
  title?: string
  publicationScope?: 'app' | 'ecosystem'
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

export function useBlogPublish() {
  const { publish, publishing, publishError } = usePublish()
  const { updateDocument } = useFirestoreUpdate()

  async function publishBlog(input: BlogPublishInput) {
    return publish(async () => {

      const slug = await assertPublicSlug(input.slug, {
        label: 'Blog post slug',
        namespace: 'blog',
        reservedScope: 'entity',
      })
      const title = input.title === undefined ? undefined : clean(input.title)

      if (!slug) throw new Error('Blog post slug is required before publishing.')
      if (input.title !== undefined && !title) {
        throw new Error('Blog post title is required before publishing.')
      }

      await updateDocument(BlogPostStorage.collection, slug, {
        slug,
        visibility: 'public',
        publication_scope: input.publicationScope || 'app',
      })
      return { id: slug, routePath: `/blog/${encodeURIComponent(slug)}` }
    })
  }

  return {
    publishBlog,
    publishing,
    publishError,
  }
}
