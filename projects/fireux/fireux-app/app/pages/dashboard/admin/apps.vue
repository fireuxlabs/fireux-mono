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
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2>All apps</h2>
              <p>Click apps to add or remove them from the featured list.</p>
            </div>

            <UBadge variant="soft">{{ selectableRows.length }}</UBadge>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="row in selectableRows"
            :key="row.slug"
            :class="selectionClass(isSelected(row.slug, selectedValues))"
            role="button"
            tabindex="0"
            @click="toggleSlug(row.slug)"
            @keydown.enter.prevent="toggleSlug(row.slug)"
            @keydown.space.prevent="toggleSlug(row.slug)"
          >
            <AppCardsCell
              v-bind="row.card"
              :link="false"
              :show-badges="false"
            />
            <UBadge
              class="absolute right-3 top-3"
              :color="isSelected(row.slug, selectedValues) ? 'primary' : 'neutral'"
              :variant="isSelected(row.slug, selectedValues) ? 'solid' : 'soft'"
            >
              {{ isSelected(row.slug, selectedValues) ? 'Featured' : 'Feature' }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </template>
  </AdminFeaturedSlugsSelection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminFeaturedSlugsSelection from 'fireux-core/runtime/components/Admin/FeaturedSlugsSelection.vue'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import {
  useAppInterface,
  type AppCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { AppModel } from 'fireux-core/runtime/models/core/app.model'

const { apps } = useAppCollection()
const { cell: appCell } = useAppInterface()
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
const selectableRows = computed<{ slug: string, card: AppCard.Card }[]>(() =>
  selectableApps.value
    .map((app) => {
      const slug = clean(app.slug)
      const card = appCell(app)
      return slug && card ? { slug, card } : null
    })
    .filter((row): row is { slug: string, card: AppCard.Card } =>
      Boolean(row)
    )
)

const isSelected = (slug: string, selectedValues: string[]) =>
  selectedValues.includes(slug)

const selectionClass = (selected: boolean) => [
  'relative rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  selected
    ? 'ring-2 ring-primary bg-primary/5'
    : 'ring-1 ring-default hover:ring-primary/40',
]

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
