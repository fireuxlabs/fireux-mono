import type { BlogEditorialReview, BlogPost, BlogPostUpdateInput } from './blog-post'
import { assertBlogEditorialApproval } from './editorial-review'

export type BlogEditorialFields = Pick<BlogPost, 'title' | 'content' | 'metaDescription'>

/** Editing prose must not change the post's identity or publication settings. */
export function buildBlogEditorialUpdate(
  post: BlogPost,
  fields: BlogEditorialFields,
  review: BlogEditorialReview,
): BlogPostUpdateInput {
  const title = fields.title.trim()
  const content = fields.content.trim()
  const metaDescription = fields.metaDescription.trim()
  if (!title || !content.replace(/<[^>]*>/g, '').trim()) {
    throw new Error('Add a title and article content before saving.')
  }
  if (title.length > 240 || content.length > 200_000 || metaDescription.length > 500) {
    throw new Error('The title, article or description exceeds the supported length.')
  }
  assertBlogEditorialApproval({ ...post, title, content, metaDescription, editorial_review: review })
  const words = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return {
    title, content, metaDescription,
    readingTime: `${Math.max(1, Math.ceil(words / 200))} min`,
    editorial_review: { ...review },
  }
}
