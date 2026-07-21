<!-- Concurrent edit — 2026-07-21 17:01 CEST — Dashboard Family pass: turn App curation into a catalog-backed, outcome-safe selection page. -->
<template>
  <UDashboardPanel id="dashboard-admin-apps">
    <template #header>
      <LayoutsDashboardNavbar title="Featured apps" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <AdminFeaturedSlugsSelection
            field="featured_app_slugs"
            headline="Public directory curation"
            title="Featured apps"
            description="Choose which published apps appear first on FireUX app surfaces."
            empty-label="No featured apps selected yet."
            saved-label="Featured apps saved"
            failed-label="Failed to save featured apps"
          >
            <template #default="{ selectedValues, toggleSlug }">
              <UPageCard
                title="Published apps"
                description="Select an app to add or remove it from the featured list."
                icon="i-lucide-app-window"
                variant="subtle"
              >
                <MoleculesStateCard
                  v-if="directoryOutcome === 'pending'"
                  entity="apps"
                  state="loading"
                  surface="bare"
                />

                <MoleculesStateCard
                  v-else-if="directoryOutcome === 'error'"
                  entity="apps"
                  state="error"
                  surface="bare"
                />

                <MoleculesStateCard
                  v-else-if="directoryOutcome === 'empty'"
                  entity="apps"
                  state="empty"
                  surface="bare"
                />

                <div v-else class="grid gap-3 sm:grid-cols-2">
                  <MoleculesActionSurface
                    v-for="row in selectableRows"
                    :key="row.slug"
                    action
                    :aria-label="`${isSelected(row.slug, selectedValues) ? 'Remove' : 'Feature'} ${row.card.displayName}`"
                    :class="selectionClass(isSelected(row.slug, selectedValues))"
                    @activate="toggleSlug(row.slug)"
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
                  </MoleculesActionSurface>
                </div>
              </UPageCard>
            </template>
          </AdminFeaturedSlugsSelection>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import AdminFeaturedSlugsSelection from 'fireux-core/runtime/components/Admin/FeaturedSlugsSelection.vue'
import {
  useAppInterface,
  type AppCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { usePlatformAppDirectory } from '../../../composables/usePlatformDirectory'

const { apps, outcome: directoryOutcome } = usePlatformAppDirectory()
const { cell: appCell } = useAppInterface()
const clean = (value: unknown) => String(value ?? '').trim()

const selectableApps = computed(() =>
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
      const card = appCell(app as Parameters<typeof appCell>[0])
      return slug && card ? { slug, card } : null
    })
    .filter((row): row is { slug: string, card: AppCard.Card } =>
      Boolean(row)
    )
)

const isSelected = (slug: string, selectedValues: string[]) =>
  selectedValues.includes(slug)

const selectionClass = (selected: boolean) => [
  'relative w-full rounded-lg border p-2 transition',
  selected
    ? 'border-primary bg-primary/5'
    : 'border-default bg-default hover:border-primary/50',
]

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'apps',
    label: 'Featured apps',
    description: 'Choose which published apps appear first on public surfaces.',
    icon: 'i-lucide-app-window',
    order: 30,
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: 'Featured apps' })
</script>
