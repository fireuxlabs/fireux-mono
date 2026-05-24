<template>
  <UDashboardPanel :id="`dashboard-admin-${domain}`">
    <template #header>
      <LayoutsDashboardNavbar :title="`Admin · ${title}`" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <AdminFeaturedSlugs
              :field="field"
              :title="`Featured ${title.toLowerCase()} slugs`"
              :description="description"
              :placeholder="placeholder"
            />
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  domain: string
  title: string
  description?: string
  placeholder?: string
}>(), {
  description: 'Add comma-separated slugs to feature on this public surface.',
  placeholder: 'slug-one, slug-two',
})

const field = computed<`featured_${string}_slugs`>(() =>
  `featured_${props.domain}_slugs` as `featured_${string}_slugs`
)
</script>
