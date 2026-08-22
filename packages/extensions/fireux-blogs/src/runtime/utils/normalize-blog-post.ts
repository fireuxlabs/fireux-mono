import type {
  BlogAuthor,
  BlogPost,
  BlogPostCreateInput,
  BlogPostUpdateInput,
  BlogVisibility,
} from '../models/blogPost.model'

const record = (value: unknown): Record<string, any> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null
const text = (value: unknown) => String(value ?? '').trim()
const strings = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

const author = (value: unknown): BlogAuthor => {
  const source = record(value)
  return {
    id: text(source?.id),
    display_name: text(source?.display_name),
    avatar: text(source?.avatar),
    ...(text(source?.handle) ? { handle: text(source?.handle) } : {}),
  }
}

export function normalizeBlogPost(
  idValue: unknown,
  value: unknown
): BlogPost | null {
  const id = text(idValue)
  const source = record(value)
  if (!id || !source) return null
  return {
    id,
    source_app_id: text(source.source_app_id || source.appId),
    visibility: (source.visibility === 'public' ? 'public' : 'app') as BlogVisibility,
    publication_scope:
      source.publication_scope === 'ecosystem' ? 'ecosystem' : 'app',
    title: text(source.title),
    content: text(source.content),
    metaDescription: text(source.metaDescription),
    slug: text(source.slug) || id,
    author: author(source.author),
    keywords: strings(source.keywords),
    tags: strings(source.tags),
    canonicalUrl: text(source.canonicalUrl),
    featuredImage: text(source.featuredImage),
    featuredImageAlt: text(source.featuredImageAlt),
    socialImage: text(source.socialImage),
    readingTime: text(source.readingTime),
    cta_link: text(source.cta_link),
    cta_text: text(source.cta_text),
    type: source.type === 'product' ? 'product' : 'article',
    product_id: text(source.product_id),
    editorial_review: (record(source.editorial_review) || {}) as BlogPost['editorial_review'],
    sproochli: (record(source.sproochli) || undefined) as BlogPost['sproochli'],
    created: (record(source.created) || { at: source.created_at }) as BlogPost['created'],
    updated: (record(source.updated) || { at: source.updated_at }) as BlogPost['updated'],
  }
}

const UPDATE_FIELDS = [
  'visibility', 'publication_scope', 'title', 'content', 'metaDescription',
  'author', 'keywords', 'tags', 'canonicalUrl', 'featuredImage',
  'featuredImageAlt', 'socialImage', 'readingTime', 'cta_link', 'cta_text',
  'type', 'product_id', 'editorial_review', 'sproochli',
] as const

export function normalizeBlogPostCreate(
  value: BlogPostCreateInput
): BlogPostCreateInput {
  const normalized = normalizeBlogPost(value.slug, value)
  if (!normalized) return value
  const { id: _id, created: _created, updated: _updated, ...input } = normalized
  return input
}

export function normalizeBlogPostUpdate(value: unknown): BlogPostUpdateInput {
  const source = record(value)
  if (!source) return {}
  return Object.fromEntries(
    UPDATE_FIELDS.filter(field => field in source).map(field => [field, source[field]])
  ) as BlogPostUpdateInput
}
