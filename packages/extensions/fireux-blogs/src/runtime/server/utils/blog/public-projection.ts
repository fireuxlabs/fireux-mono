import { useRuntimeConfig } from '#imports'
import { getQuery, type H3Event } from 'h3'
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

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const languageCode = (value: unknown) => {
  const language = text(value, 24).replace(/_/g, '-').toLowerCase()
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(language)
    ? language
    : ''
}

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
  language: string
}

export function readPublicBlogRuntimeScope(
  event: H3Event
): PublicBlogRuntimeScope | null {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const blogs = record(fireux.blogs)
  const role = text(fireux.role, 40)
  const ecosystemId = text(fireux.ecosystemId, 120)
  const appId = text(fireux.id, 1_500)
  const configuredLanguages = strings(blogs.languages, 20, 24)
    .map(languageCode)
    .filter(Boolean)
  const defaultLanguage = languageCode(blogs.defaultLanguage)
  const requestedLanguage = languageCode(getQuery(event).language)
  const language =
    requestedLanguage &&
    (!configuredLanguages.length || configuredLanguages.includes(requestedLanguage))
      ? requestedLanguage
      : defaultLanguage
  if (
    !ecosystemId ||
    !['global', 'tenant', 'standalone'].includes(role) ||
    (role === 'tenant' && !isFirestoreDocumentId(appId))
  ) return null

  return { ecosystemId, language }
}

type BlogPostLocalizedFields = {
  title: string
  content: string
  metaDescription: string
  keywords: string[]
  tags: string[]
  featuredImage: string
  socialImage: string
  readingTime: string
  cta_text: string
}

function readLocalizedFields(
  data: Record<string, unknown>,
  requestedLanguage: string
): {
  fields: BlogPostLocalizedFields
  language: string
  availableLanguages: string[]
} {
  const rootFields: BlogPostLocalizedFields = {
    title: text(data.title, 240),
    content: text(data.content, 200_000),
    metaDescription: text(data.metaDescription, 500),
    keywords: strings(data.keywords, 30, 120),
    tags: strings(data.tags, 30, 120),
    featuredImage: httpsUrl(data.featuredImage),
    socialImage: httpsUrl(data.socialImage),
    readingTime: text(data.readingTime, 40),
    cta_text: text(data.cta_text, 120),
  }
  const sproochli = record(data.sproochli)
  const defaultLanguage = languageCode(sproochli.default_language)
  const translations = record(sproochli.translations)
  const approvedLanguages = Object.entries(translations)
    .filter(([language, value]) => {
      const translation = record(value)
      return (
        Boolean(languageCode(language)) &&
        translation.status === 'approved' &&
        Boolean(text(translation.title, 240)) &&
        Boolean(text(translation.content, 200_000))
      )
    })
    .map(([language]) => languageCode(language))
  const availableLanguages = [
    ...new Set([
      ...(defaultLanguage ? [defaultLanguage] : []),
      ...approvedLanguages,
    ]),
  ]
  const translation = requestedLanguage && requestedLanguage !== defaultLanguage
    ? record(translations[requestedLanguage])
    : {}
  if (
    translation.status !== 'approved' ||
    !text(translation.title, 240) ||
    !text(translation.content, 200_000)
  ) {
    return {
      fields: rootFields,
      language: defaultLanguage,
      availableLanguages,
    }
  }

  return {
    fields: {
      title: text(translation.title, 240),
      content: text(translation.content, 200_000),
      metaDescription:
        text(translation.metaDescription, 500) || rootFields.metaDescription,
      keywords:
        strings(translation.keywords, 30, 120).length
          ? strings(translation.keywords, 30, 120)
          : rootFields.keywords,
      tags:
        strings(translation.tags, 30, 120).length
          ? strings(translation.tags, 30, 120)
          : rootFields.tags,
      featuredImage:
        httpsUrl(translation.featuredImage) || rootFields.featuredImage,
      socialImage:
        httpsUrl(translation.socialImage) || rootFields.socialImage,
      readingTime:
        text(translation.readingTime, 40) || rootFields.readingTime,
      cta_text:
        text(translation.cta_text, 120) || rootFields.cta_text,
    },
    language: requestedLanguage,
    availableLanguages,
  }
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
  const localized = readLocalizedFields(data, scope.language)
  const {
    title,
    content,
    metaDescription,
    keywords,
    tags,
    featuredImage,
    socialImage,
    readingTime,
    cta_text,
  } = localized.fields
  const author =
    data.author && typeof data.author === 'object' && !Array.isArray(data.author)
      ? data.author as Record<string, unknown>
      : {}
  const displayName = text(author.display_name, 120)
  const type = data.type === 'article' || data.type === 'product' ? data.type : ''
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
    visibility: 'public',
    language: localized.language,
    available_languages: localized.availableLanguages,
    title,
    content,
    metaDescription,
    author: {
      display_name: displayName,
      ...(avatar ? { avatar } : {}),
      ...(handle ? { handle } : {}),
    },
    keywords,
    tags,
    canonicalUrl: httpsUrl(data.canonicalUrl),
    featuredImage,
    socialImage,
    readingTime,
    cta_link: httpsUrl(data.cta_link),
    cta_text,
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
