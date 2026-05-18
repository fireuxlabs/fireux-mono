import { useBlogFetch } from './fetch/useBlogFetch.ts'
import { useBlogCreate } from './mutations/useBlogCreate.ts'
import { useBlogUpdate } from './mutations/useBlogUpdate.ts'
import { useBlogDelete } from './mutations/useBlogDelete.ts'
import { useBlogUtils } from './utils/useBlogUtils.ts'
import { useBlogInterface } from './utils/view/useBlogInterface.ts'

/**
 * FireUX stack family: Publishable root entity.
 * Entity: BlogPost.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-blogs/docs/contract.md
 *
 * This file is the BlogPost family entry seam for root reads, writes, and view helpers.
 * Blog authoring/editor state belongs to the Blog family, not fireux/app or firestore/blog.
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
