<template>
  <UPage>
    <UPageHeader
      title="Dev · Blogs (Ext)"
      description="Model shape for Blogs collection."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Model</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('model')"
            >
              {{ openSections.model ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.model" class="mt-4">
            <DevModel
              :title="'Blogs · Model'"
              :model="blogPostModelRuntime"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Collection</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('collection')"
            >
              {{ openSections.collection ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.collection" class="mt-4">
            <UCard>
              <template #header>
                <div class="space-y-3">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Blogs collection
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Inspect model drift separately from the public blog collection manager.
                  </p>
                  <DevDriftToolbar
                    :drift-kind="blogsDriftKind"
                    :selected-field="blogsSelectedField"
                    :filter-options="blogsFilterOptions"
                    :copy-label="'Copy drift · Blogs'"
                    :copy-payload="blogsDriftCopyPayload"
                    @update:drift-kind="setBlogsDriftKind"
                    @update:selected-field="updateBlogsSelectedField"
                  />
                </div>
              </template>
            </UCard>

            <BlogCollectionManager />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed, reactive } from 'vue'
import { useBlogCollection } from '../../composables/fireux/firestore/blog/fetch/useBlogCollection'
import type { BlogPost } from '../../models/blogPost.model'
import { BlogPost as BlogPostModelRuntime } from '../../models/blogPost.model'

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

const openSections = reactive({
  model: false,
  collection: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

const blogPostModelRuntime = BlogPostModelRuntime

const { collection } = useBlogCollection()

const blogsCollection = computed<Array<BlogPost & { id: string }>>(() =>
  (collection.value ?? []).map((post) => ({ ...post, id: post.slug }))
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

const filteredBlogsDriftPayload = computed(() =>
  filteredBlogs.value.map((post) => {
    const drift = blogsDriftById.value.get(post.id) ?? { missing: [], extra: [] }
    return {
      id: post.id,
      title: post.title,
      drift,
    }
  })
)

const blogsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts',
  driftKind: blogsDriftKind.value,
  selectedField: blogsSelectedField.value || null,
  totalBlogs: filteredBlogs.value.length,
  blogs: filteredBlogsDriftPayload.value,
}))

const updateBlogsSelectedField = (value: string) => {
  blogsSelectedField.value = value
}
</script>
