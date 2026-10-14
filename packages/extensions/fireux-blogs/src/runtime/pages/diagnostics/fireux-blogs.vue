<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Blogs (Ext)"
      description="Model shape for Blogs collection."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Model</div>
            <UButton variant="ghost" size="xs" @click="toggleSection('model')">
              {{ openSections.model ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.model" class="mt-4">
            <DiagnosticsModel :title="'Blogs · Model'" :model="blogPostModelRuntime" />
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
                  <p class="text-sm font-semibold text-highlighted">
                    Blogs collection
                  </p>
                  <p class="text-xs text-muted">
                    Inspect model drift separately from the Blog directory
                    manager.
                  </p>
                  <DiagnosticsDriftToolbar
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
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed, reactive } from 'vue'
import { useBlogCollection } from '../../blog/composables/useBlogCollection'
import type { BlogPost } from '../../blog/utils/blog-post'
import { BlogPostDefaults as BlogPostModelRuntime } from '../../blog/utils/blog-post'

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-blogs',
    label: 'Blogs (Ext)',
    icon: 'i-lucide-newspaper',
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})

const openSections = reactive({
  model: false,
  collection: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

const blogPostModelRuntime = { ...BlogPostModelRuntime }

const { collection } = useBlogCollection()

const blogsCollection = computed<BlogPost[]>(() => collection.value ?? [])

const {
  driftKind: blogsDriftKind,
  setDriftKind: setBlogsDriftKind,
  selectedField: blogsSelectedField,
  driftById: blogsDriftById,
  filterOptions: blogsFilterOptions,
  filteredCollection: filteredBlogs,
} = useDiagnosticsDriftFilter<BlogPost>({
  collection: blogsCollection,
  runtimeModel: blogPostModelRuntime,
})

const filteredBlogsDriftPayload = computed(() =>
  filteredBlogs.value.map((post) => {
    const drift = blogsDriftById.value.get(post.id) ?? {
      missing: [],
      extra: [],
    }
    return {
      id: post.id,
      title: post.title,
      drift,
    }
  })
)

const blogsDriftCopyPayload = computed(() => ({
  modelPath:
    'packages/extensions/fireux-blogs/src/runtime/blog/utils/blog-post.ts',
  driftKind: blogsDriftKind.value,
  selectedField: blogsSelectedField.value || null,
  totalBlogs: filteredBlogs.value.length,
  blogs: filteredBlogsDriftPayload.value,
}))

const updateBlogsSelectedField = (value: string) => {
  blogsSelectedField.value = value
}
</script>
