<template>
  <FireActionSurface
    :to="to"
    :aria-label="`Read ${title}`"
    class="blog-story"
    :class="{ 'blog-story--lead': lead }"
  >
    <UBlogPost
      :title="title"
      :description="summary"
      :badge="badge"
      :authors="authors"
      :image="image"
      :orientation="lead ? 'horizontal' : 'vertical'"
      variant="subtle"
      :ui="blogPostUi"
    >
      <template #footer>
        <div class="blog-story__footer">
          <div v-if="visibleTags.length" class="blog-story__tags">
            <UBadge
              v-for="tag in visibleTags"
              :key="tag"
              :label="tag"
              color="neutral"
              variant="outline"
              size="xs"
            />
          </div>

          <span class="blog-story__read">
            Read story
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </span>
        </div>
      </template>
    </UBlogPost>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed, type ImgHTMLAttributes } from 'vue'
import type { BlogCard } from '../../composables/useBlogInterface'

defineOptions({ name: 'BlogCardsStory' })

type StoryProps = Pick<
  BlogCard.Card,
  | 'to'
  | 'title'
  | 'summary'
  | 'imageUrl'
  | 'imageAlt'
  | 'author'
  | 'authorAvatarUrl'
  | 'authorHandle'
  | 'readingTime'
  | 'tags'
  | 'type'
> & {
  lead?: boolean
}

const props = withDefaults(defineProps<StoryProps>(), {
  authorAvatarUrl: '',
  authorHandle: '',
  lead: false,
  readingTime: '',
  tags: () => [],
  type: 'article',
})

const typeLabel = computed(() =>
  props.type === 'product' ? 'Product note' : 'Article'
)
const badge = computed(() => ({
  label: typeLabel.value,
  color: 'primary' as const,
  variant: 'soft' as const,
}))
const visibleTags = computed(() =>
  Array.from(
    new Set(props.tags.map((tag) => String(tag || '').trim()).filter(Boolean))
  ).slice(0, props.lead ? 3 : 2)
)
const readingTimeLabel = computed(() => {
  const value = String(props.readingTime || '').trim()
  if (!value) return ''
  return /read$/i.test(value) ? value : `${value} read`
})
const authorDescription = computed(() =>
  [
    props.authorHandle
      ? `@${String(props.authorHandle).trim().replace(/^@/, '')}`
      : '',
    readingTimeLabel.value,
  ]
    .filter(Boolean)
    .join(' · ')
)
const authors = computed(() => [
  {
    name: props.author,
    description: authorDescription.value,
    avatar: props.authorAvatarUrl
      ? ({
          src: props.authorAvatarUrl,
          alt: '',
          loading: 'lazy',
          decoding: 'async',
        } satisfies ImgHTMLAttributes)
      : undefined,
  },
])
const image = computed(() => ({
  src: props.imageUrl,
  alt: props.imageAlt,
  loading: (props.lead ? 'eager' : 'lazy') as 'eager' | 'lazy',
  decoding: 'async' as const,
  ...(props.lead ? { fetchpriority: 'high' } : {}),
}))

const blogPostUi = {
  root: 'blog-story__post',
  header: 'blog-story__media',
  image: 'blog-story__image',
  body: 'blog-story__body',
  title: 'blog-story__title',
  description: 'blog-story__summary',
  footer: 'blog-story__footer-slot',
}
</script>

<style scoped>
.blog-story {
  color: inherit;
  display: block;
  height: 100%;
  text-decoration: none;
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
}

.blog-story:hover {
  box-shadow: 0 calc(var(--spacing) * 5) calc(var(--spacing) * 12)
    color-mix(in srgb, var(--ui-primary) 14%, transparent);
  transform: translateY(calc(var(--spacing) * -1));
}

.blog-story :deep(.blog-story__post) {
  height: 100%;
}

.blog-story :deep(.blog-story__media) {
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg-elevated));
}

.blog-story :deep(.blog-story__image) {
  transition: transform 240ms ease;
}

.blog-story:hover :deep(.blog-story__image) {
  transform: scale(1.035);
}

.blog-story :deep(.blog-story__title) {
  letter-spacing: var(--tracking-tight);
}

.blog-story--lead :deep(.blog-story__title) {
  font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
  line-height: var(--leading-tight);
}

.blog-story :deep(.blog-story__summary) {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.blog-story--lead :deep(.blog-story__summary) {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  -webkit-line-clamp: 4;
}

.blog-story :deep(.blog-story__footer-slot) {
  padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 4);
}

.blog-story--lead :deep(.blog-story__footer-slot) {
  padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 4);
}

.blog-story__footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  justify-content: space-between;
}

.blog-story__tags {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.5);
}

.blog-story__read {
  align-items: center;
  color: var(--ui-primary);
  display: inline-flex;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  gap: calc(var(--spacing) * 1.5);
  margin-left: auto;
}

@media (min-width: 64rem) {
  .blog-story--lead :deep(.blog-story__footer-slot) {
    grid-column: 1 / -1;
    padding: 0 calc(var(--spacing) * 6) calc(var(--spacing) * 6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .blog-story,
  .blog-story :deep(.blog-story__image) {
    transition: none;
  }

  .blog-story:hover,
  .blog-story:hover :deep(.blog-story__image) {
    transform: none;
  }
}
</style>
