import type { BlogPost } from '../../../utils/blog-post'

type BlogRuntimeScope = {
  appId: string
  isTenant: boolean
}

export function isBlogPostInRuntimeScope(
  post: BlogPost,
  runtime: BlogRuntimeScope
): boolean {
  if (!runtime.isTenant) return true
  return Boolean(runtime.appId) && post.source_app_id === runtime.appId
}
