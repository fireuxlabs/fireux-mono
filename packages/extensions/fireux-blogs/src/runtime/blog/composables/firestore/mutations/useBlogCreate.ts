import { useBlogCommand } from '../../authoring/useBlogCommand'
import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validate-public-slug'
import type { BlogPostCreateInput } from '../../../utils/blog-post'

export function useBlogCreate() {
  const { command, captureIntent } = useBlogCommand()
  async function createBlogPost(payload: BlogPostCreateInput, slug: string): Promise<boolean> {
    const body = JSON.parse(JSON.stringify(payload)), isCurrent = captureIntent()
    const id = await assertPublicSlug(slug, { label: 'Blog post slug', namespace: 'blog', reservedScope: 'entity' })
    if (!isCurrent()) throw new Error('The Blog authoring context changed.')
    await command(id, 'create', { ...body, slug: id })
    return true
  }
  return { createBlogPost }
}
