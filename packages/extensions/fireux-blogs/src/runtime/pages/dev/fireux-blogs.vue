<template>
  <UPage>
    <UPageHeader
      title="Dev · Blogs (Ext)"
      description="Model shape for Blogs collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Blogs · Model'"
          :model="blogPostModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Blogs collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse blog posts resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="blogsDriftKind"
                :selected-field="blogsSelectedField"
                :filter-options="blogsFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Blogs'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setBlogsDriftKind"
                @update:selected-field="updateBlogsSelectedField"
                @copy="copyBlogsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Blogs (JSON)'"
            :data="allBlogsJsonPayload"
            :default-open="false"
          />
        </template>

        <BlogCollectionManager :cards="cards" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useBlogFetch } from '../../composables/fireux/firestore/objects/blog/fetch/useBlogFetch'
import { useBlogInterface } from '../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface'
import type { BlogPost } from '../../models/objects/blogPost.model'
import { BlogPostRuntime as BlogPostModelRuntime } from '../../models/objects/blogPost.model';

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-blogs',
    label: 'Blogs (Ext)',
    icon: 'i-lucide-newspaper',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const blogPostModelRuntime = BlogPostModelRuntime

const { items } = useBlogFetch()
const { card: makeCard } = useBlogInterface()

const blogsCollection = computed<Array<BlogPost & { id: string }>>(() =>
  (items.value ?? []).map((post) => ({ ...post, id: post.slug }))
)

const {
  driftKind: blogsDriftKind,
  setDriftKind: setBlogsDriftKind,
  selectedField: blogsSelectedField,
  driftById: blogsDriftById,
  filterOptions: blogsFilterOptions,
  filteredCollection: filteredBlogs,
} = useDevDriftFilter<BlogPost & { id: string }>({
  collection: blogsCollection,
  runtimeModel: blogPostModelRuntime,
})

const cards = computed(() =>
  filteredBlogs.value
    .map((post) => makeCard(post))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const allBlogsJsonPayload = computed(() => ({
  totalBlogs: blogsCollection.value.length,
  blogs: blogsCollection.value,
}))

const filteredBlogsDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = blogsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      title: card.title,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyBlogsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts',
      driftKind: blogsDriftKind.value,
      selectedField: blogsSelectedField.value || null,
      totalBlogs: cards.value.length,
      blogs: filteredBlogsDriftPayload.value,
    },
    { label: 'Dev · Blogs · Filtered drift' }
  )
}

const updateBlogsSelectedField = (value: string) => {
  blogsSelectedField.value = value
}
</script>
