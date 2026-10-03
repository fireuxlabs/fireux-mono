import { usePublish } from 'fireux-core/runtime/composables/fireux/publishing/usePublish'
import { useBlogCommand } from '../../authoring/useBlogCommand'

export type BlogPublishInput = { slug: string; title?: string; publicationScope?: 'app' | 'ecosystem' }
export function useBlogPublish() {
  const { publish, publishing, publishError } = usePublish()
  const { command } = useBlogCommand()
  async function publishBlog(input: BlogPublishInput) {
    const slug = String(input.slug || '').trim(), title = input.title?.trim()
    if (!slug || (input.title !== undefined && !title)) throw new Error('Blog post slug and title are required before publishing.')
    return publish(async () => {
      await command(slug, 'publish', { publicationScope: input.publicationScope || 'app' })
      return { id: slug, routePath: `/blog/${encodeURIComponent(slug)}` }
    })
  }
  return { publishBlog, publishing, publishError }
}
