<template>
  <UPage>
    <UPageHeader
      title="Dev · Blogs (Ext)"
      description="Model shape for Blogs collection."
    />

    <UPageBody class="pagebody">
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
                :copy-label="'Copy drift · Blogs'"
                :copy-payload="blogsDriftCopyPayload"
                @update:drift-kind="setBlogsDriftKind"
                @update:selected-field="updateBlogsSelectedField"
              />
            </div>
          </div>
        </template>

        <BlogCollectionManager :collection="filteredBlogs" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useBlogCollection } from '../../composables/fireux/firestore/objects/blog/fetch/useBlogCollection'
import type { BlogPost } from '../../models/objects/blogPost.model'
import { BlogPost as BlogPostModelRuntime } from '../../models/objects/blogPost.model'

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
  modelPath: 'packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts',
  driftKind: blogsDriftKind.value,
  selectedField: blogsSelectedField.value || null,
  totalBlogs: filteredBlogs.value.length,
  blogs: filteredBlogsDriftPayload.value,
}))

const updateBlogsSelectedField = (value: string) => {
  blogsSelectedField.value = value
}
</script>
