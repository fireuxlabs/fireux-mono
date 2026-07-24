import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type {
  PublicBlogPostIndexProjection,
  PublicBlogPostProjection,
} from '../../../models/blogPost-public.model.ts'

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim().length <= maxLength
    ? value.trim()
    : ''

const strings = (value: unknown, maxItems: number, maxLength: number) =>
  Array.isArray(value) && value.length <= maxItems
    ? value.map(item => text(item, maxLength)).filter(Boolean)
    : []

const httpsUrl = (value: unknown) => {
  const url = text(value, 2_048)
  if (!url) return ''
  try {
    return new URL(url).protocol === 'https:' ? url : ''
  } catch {
    return ''
  }
}

const excerpt = (value: string, maxLength = 320) => {
  const normalized = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export type PublicBlogRuntimeScope = {
  ecosystemId: string
}

export function readPublicBlogRuntimeScope(
  event: H3Event
): PublicBlogRuntimeScope | null {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const role = text(fireux.role, 40)
  const ecosystemId = text(fireux.ecosystemId, 120)
  const appId = text(fireux.id, 1_500)
  if (
    !ecosystemId ||
    !['global', 'tenant', 'standalone'].includes(role) ||
    (role === 'tenant' && !isFirestoreDocumentId(appId))
  ) return null

  return { ecosystemId }
}

export function isPublicBlogCandidate(
  id: string,
  data: Record<string, unknown>,
  scope: PublicBlogRuntimeScope
) {
  if (!isFirestoreDocumentId(id) || data.visibility !== 'public') return false
  if (text(data.source_ecosystem_id, 120) !== scope.ecosystemId) return false
  const sourceAppId = text(data.source_app_id, 1_500)
  return isFirestoreDocumentId(sourceAppId)
}

export function projectPublicBlogPost(
  id: string,
  data: Record<string, unknown>,
  scope: PublicBlogRuntimeScope
): PublicBlogPostProjection | null {
  if (!isPublicBlogCandidate(id, data, scope)) return null
  const slug = text(data.slug, 1_500)
  const title = text(data.title, 240)
  const content = text(data.content, 200_000)
  const author =
    data.author && typeof data.author === 'object' && !Array.isArray(data.author)
      ? data.author as Record<string, unknown>
      : {}
  const displayName = text(author.display_name, 120)
  const type = data.type === 'article' || data.type === 'product' ? data.type : ''
  const featuredImage = httpsUrl(data.featuredImage)
  const socialImage = httpsUrl(data.socialImage)
  if (
    slug !== id ||
    !title ||
    !content ||
    !displayName ||
    !type ||
    !featuredImage ||
    !socialImage
  ) return null

  const avatar = httpsUrl(author.avatar)
  const handle = text(author.handle, 120)
  return {
    id,
    slug,
    title,
    content,
    metaDescription: text(data.metaDescription, 500),
    author: {
      display_name: displayName,
      ...(avatar ? { avatar } : {}),
      ...(handle ? { handle } : {}),
    },
    keywords: strings(data.keywords, 30, 120),
    tags: strings(data.tags, 30, 120),
    canonicalUrl: httpsUrl(data.canonicalUrl),
    featuredImage,
    socialImage,
    readingTime: text(data.readingTime, 40),
    cta_link: httpsUrl(data.cta_link),
    cta_text: text(data.cta_text, 120),
    type,
    product_id: text(data.product_id, 1_500),
  }
}

export function projectPublicBlogIndexPost(
  id: string,
  data: Record<string, unknown>,
  scope: PublicBlogRuntimeScope
): PublicBlogPostIndexProjection | null {
  const post = projectPublicBlogPost(id, data, scope)
  if (!post) return null

  const { content, ...indexPost } = post
  return {
    ...indexPost,
    excerpt: post.metaDescription || excerpt(content),
  }
}
