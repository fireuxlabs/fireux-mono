import { useBlogFetch } from './fetch/useBlogFetch.ts'
import { useBlogCreate } from './mutations/useBlogCreate.ts'
import { useBlogUpdate } from './mutations/useBlogUpdate.ts'
import { useBlogDelete } from './mutations/useBlogDelete.ts'
import { useBlogUtils } from './utils/useBlogUtils.ts'
import { useBlogInterface } from './utils/view/useBlogInterface.ts'

/**
 * Canonical facade for blog posts: fetch + mutations + helpers.
 */
export function useBlog() {
  const { items, fetchBySlug } = useBlogFetch()
  const { createBlogPost } = useBlogCreate()
  const { updateBlogPost } = useBlogUpdate()
  const { deleteBlogPost } = useBlogDelete()
  const utils = useBlogUtils()
  const view = useBlogInterface()

  return {
    items,
    fetchBySlug,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    utils,
    view,
  }
}
