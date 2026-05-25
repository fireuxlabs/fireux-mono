<template>
  <AdminFeaturedSlugsSelection
    field="featured_app_slugs"
    panel-id="dashboard-admin-apps"
    nav-title="Admin · Apps"
    title="Featured apps"
    description="Select app slugs to feature on public app surfaces."
    empty-label="No featured apps selected yet."
    saved-label="Featured apps saved"
    failed-label="Failed to save featured apps"
  >
    <template #default="{ selectedValues, toggleSlug }">
      <AppCollectionManager
        :collection="selectableApps"
        title="All apps"
        description="Click apps to add or remove them from the featured list."
        :link="false"
        selectable
        selection-field="slug"
        :selected-values="selectedValues"
        selected-label="Featured"
        unselected-label="Feature"
        initial-variant="cell"
        @toggle-selection="toggleSlug"
      />
    </template>
  </AdminFeaturedSlugsSelection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminFeaturedSlugsSelection from 'fireux-core/runtime/components/Admin/FeaturedSlugsSelection.vue'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import type { AppModel } from 'fireux-core/runtime/models/core/app.model'

const { apps } = useAppCollection()
const clean = (value: unknown) => String(value ?? '').trim()

const selectableApps = computed<AppModel[]>(() =>
  (apps.value ?? [])
    .filter((entry) => clean(entry.id) && clean(entry.slug))
    .sort((a, b) =>
      clean(a.app_name || a.app_short_name || a.slug).localeCompare(
        clean(b.app_name || b.app_short_name || b.slug)
      )
    )
)

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'apps',
    label: 'Apps',
    description: 'Feature app slugs on public app surfaces.',
    icon: 'i-lucide-app-window',
    order: 30,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
