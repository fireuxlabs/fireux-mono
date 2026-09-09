import { useBlogFetch } from './fetch/useBlogFetch.ts'
import { useBlogCollection } from '../../../useBlogCollection'
import { useBlogCreate } from './mutations/useBlogCreate.ts'
import { useBlogUpdate } from './mutations/useBlogUpdate.ts'
import { useBlogDelete } from './mutations/useBlogDelete.ts'
import { useBlogPublish } from './mutations/useBlogPublish'
import { useBlogSeo } from './utils/useBlogSeo'
import { useBlogUtils } from './utils/useBlogUtils.ts'
import { useBlogComputed } from '../../blog/useBlogComputed'
import { useBlogInterface } from '../../blog/useBlogInterface'

export {
  useBlogFetch,
  useBlogCollection,
  useBlogCreate,
  useBlogUpdate,
  useBlogPublish,
  useBlogDelete,
  useBlogSeo,
  useBlogUtils,
  useBlogComputed,
  useBlogInterface,
}

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
  return {
    ...useBlogCollection(),
    ...useBlogFetch(),
    ...useBlogCreate(),
    ...useBlogUpdate(),
    ...useBlogPublish(),
    ...useBlogDelete(),
    ...useBlogUtils(),
    ...useBlogComputed(),
    ...useBlogInterface(),
    useBlogSeo,
  }
}
