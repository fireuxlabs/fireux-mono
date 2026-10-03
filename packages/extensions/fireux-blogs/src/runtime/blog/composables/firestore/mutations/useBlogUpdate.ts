import { useBlogCommand } from '../../authoring/useBlogCommand'
import type { BlogPost } from '../../../utils/blog-post'

export function useBlogUpdate() {
  const { command } = useBlogCommand()
  async function updateBlogPost(input: { blogPostId: string; changes: Partial<BlogPost> }): Promise<boolean> {
    const id = String(input.blogPostId || '').trim()
    if (!id) throw new Error('No blog post ID provided.')
    await command(id, 'update', input.changes)
    return true
  }
  return { updateBlogPost }
}
