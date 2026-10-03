import type { BlogPostFeedReference } from 'fireux-blogs/runtime/blog/utils/blog-post'
import type { InterlakenPublicCopyKey } from './sproochli-copy-public'
import type { InterlakenSiteLanguage } from './sproochli-site'

type FutterCard = {
  id: string
  labelKey: InterlakenPublicCopyKey
}

export type FutterEvent = FutterCard & {
  blogPost?: never
  titleKey: InterlakenPublicCopyKey
  bodyKey: InterlakenPublicCopyKey
  imageByLanguage: Record<InterlakenSiteLanguage, string>
  imageAltKey: InterlakenPublicCopyKey
}

export type FutterBlogPost = FutterCard & {
  blogPost: BlogPostFeedReference
}

export type FutterPost = FutterEvent | FutterBlogPost

export const futterPosts: FutterPost[] = [
  {
    id: '1-august-dorfmaert-ringgenberg',
    labelKey: 'from_region',
    blogPost: {
      kind: 'blog-post',
      slug: '1-august-dorfmaert-ringgenberg',
    },
  },
  {
    id: 'wo-sind-die-chuehlschraenke',
    labelKey: 'from_region',
    blogPost: {
      kind: 'blog-post',
      slug: 'wo-sind-die-chuehlschraenke',
    },
  },
  {
    id: 'interlaken-essen-isch-live',
    labelKey: 'feed_welcome_label',
    blogPost: {
      kind: 'blog-post',
      slug: 'interlaken-essen-isch-live',
    },
  },
]
