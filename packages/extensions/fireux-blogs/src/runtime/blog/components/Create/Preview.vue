<template>
  <div class="preview-shell">
    <UIBlogPost
      :title="blogPost.title || 'Untitled post'"
      :description="blogPost.metaDescription || 'Add a short description'"
      :image="featuredImageSrc || undefined"
      :date="createdAtLabel"
      :reading-time="blogPost.readingTime || undefined"
      :tags="blogPost.tags"
      :author="author"
    >
      <template #default>
        <div class="author-pill">
          <div class="avatar" v-if="author.avatar">
            <img :src="author.avatar" alt="Author avatar" />
          </div>
          <div class="author-meta">
            <div class="author-name">{{ author.name }}</div>
            <div class="author-handle" v-if="author.handle">
              {{ '@' + author.handle }}
            </div>
          </div>
          <span class="author-role">Author</span>
        </div>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="preview-content" v-html="sanitizedContent" />
        <p v-if="!blogPost.content" class="warning">Missing content</p>
      </template>

      <template #footer>
        <div class="footer-grid">
          <div>
            <div class="label">Slug</div>
            <div>{{ blogPost.slug || 'Missing slug' }}</div>
          </div>
          <div>
            <div class="label">Canonical URL</div>
            <a
              v-if="blogPost.canonicalUrl"
              :href="blogPost.canonicalUrl"
              target="_blank"
              rel="noopener"
            >
              {{ blogPost.canonicalUrl }}
            </a>
            <span v-else class="warning">Missing canonicalUrl</span>
          </div>
          <div>
            <div class="label">CTA</div>
            <div v-if="blogPost.cta_link || blogPost.cta_text">
              <div>{{ blogPost.cta_text || 'Button text' }}</div>
              <div class="subdued">
                {{ blogPost.cta_link || 'https://example.com' }}
              </div>
            </div>
            <span v-else class="warning">Missing cta</span>
          </div>
          <div>
            <div class="label">Social image</div>
            <div v-if="socialImageSrc" class="thumb">
              <img :src="socialImageSrc" alt="Social image preview" />
            </div>
            <span v-else class="warning">Missing social image</span>
          </div>
          <div>
            <div class="label">Branding</div>
            <div class="brand-grid">
              <div class="brand-tile wordmark">
                <div class="brand-label">Wordmark</div>
                <img
                  :src="featuredImageSrc || fallbackWordmark"
                  alt="Wordmark"
                />
              </div>
              <div class="brand-tile logo">
                <div class="brand-label">Logo</div>
                <img :src="socialImageSrc || fallbackLogo" alt="Logo" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UIBlogPost>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed, onMounted, ref } from 'vue'
import { useBlogDraftState } from '../../composables/editor/useBlogDraftState'

// Use the centralized state management
const { blogPost, featuredImageData, socialImageData } = useBlogDraftState()

// Avoid hydration drift by using a stable date label
const createdAtLabel = computed(() => 'Draft')

// Sanitize the HTML before injecting (client-only to prevent SSR mismatch)
const isClient = ref(false)
onMounted(() => {
  isClient.value = true
})

const sanitizedContent = computed(() => {
  const html = blogPost.value.content || ''
  return isClient.value ? DOMPurify.sanitize(html) : html
})

// Prefer uploaded previews, fall back to current blog post images.
const featuredImageSrc = computed(
  () => featuredImageData.value || blogPost.value.featuredImage || ''
)
const socialImageSrc = computed(
  () => socialImageData.value || blogPost.value.socialImage || ''
)

const author = computed(() => ({
  name:
    blogPost.value.author?.display_name ||
    blogPost.value.author?.handle ||
    'Author',
  avatar: blogPost.value.author?.avatar || undefined,
  handle: blogPost.value.author?.handle || undefined,
}))

const fallbackWordmark = '/img/app/wordmark-dark.png'
const fallbackLogo = '/img/app/logo.png'
</script>

<style scoped>
.thumb img {
  max-width: 220px;
  width: 100%;
  border-radius: calc(var(--ui-radius) * 2);
  border: 1px solid var(--ui-border);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: calc(var(--spacing) * 3);
}

.label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--ui-text-muted);
}

.subdued {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.warning {
  color: var(--ui-error);
  font-style: normal;
  font-size: var(--text-sm);
}

.preview-shell {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
  padding: calc(var(--spacing) * 4);
  color: var(--ui-text);
}

.author-pill {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2.5);
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  margin-bottom: calc(var(--spacing) * 3);
}

.avatar img {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  object-fit: cover;
}

.author-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.author-name {
  font-weight: var(--font-weight-semibold);
}

.author-handle {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.author-role {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.preview-content {
  position: relative;
}

.preview-content :deep(img) {
  max-width: 480px;
  max-height: 320px;
  width: 100%;
  height: auto;
  border-radius: var(--ui-radius);
  margin: calc(var(--spacing) * 3) 0;
  object-fit: contain;
}

.preview-shell :deep(.ui-blog-post__image img),
.preview-shell :deep(.ui-blog-post-image img) {
  max-height: 360px;
  width: 100%;
  object-fit: cover;
  border-radius: calc(var(--ui-radius) * 1.5);
}

.preview-content :deep(p),
.preview-content :deep(li),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  color: var(--ui-text);
}

.preview-content :deep(code) {
  background: var(--ui-bg-muted);
  padding: calc(var(--spacing) * 0.5) var(--spacing);
  border-radius: var(--ui-radius);
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: calc(var(--spacing) * 3);
}

.brand-tile {
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
  padding: calc(var(--spacing) * 3);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;
}

.brand-tile img {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: var(--ui-radius);
}

.brand-tile.logo img {
  max-width: 160px;
  aspect-ratio: 1 / 1;
}

.brand-tile.wordmark img {
  max-width: 220px;
  aspect-ratio: 2 / 1;
}

.brand-label {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
</style>
