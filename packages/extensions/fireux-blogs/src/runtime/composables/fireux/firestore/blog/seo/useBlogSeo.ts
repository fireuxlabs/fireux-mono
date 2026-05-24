import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { BlogPost } from '../../../../../models/blogPost.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildBlogJsonLd(post: Partial<BlogPost> | null | undefined) {
  const title = clean(post?.title)
  const slug = clean(post?.slug)
  if (!title || !slug || (post as any)?.visibility !== 'public') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt(post?.metaDescription || post?.content),
    image: clean(post?.socialImage || post?.featuredImage) || undefined,
    author: clean(post?.author?.display_name) || undefined,
  }
}

export function useBlogSeo(post: MaybeRefOrGetter<Partial<BlogPost> | null | undefined>) {
  const entry = computed(() => toValue(post))
  const slug = computed(() => clean(entry.value?.slug))
  const isPublic = computed(() => Boolean((entry.value as any)?.visibility === 'public' && slug.value))

  return useSeo({
    title: computed(() => clean(entry.value?.title) || 'Blog post'),
    description: computed(() => excerpt(entry.value?.metaDescription || entry.value?.content || 'Blog post.')),
    image: computed(() => clean(entry.value?.socialImage || entry.value?.featuredImage)),
    path: computed(() => (slug.value ? `/blog/${encodeURIComponent(slug.value)}` : '')),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildBlogJsonLd(entry.value)),
  })
}
