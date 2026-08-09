<!-- Concurrent edit — 2026-07-21 17:01 CEST — Dashboard Family pass: replace free-text Ecosystem slugs with the published directory. -->
<template>
  <UDashboardPanel id="dashboard-admin-ecosystems">
    <template #header>
      <LayoutsDashboardNavbar title="Featured ecosystems" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <AdminFeaturedSlugsSelection
            field="featured_ecosystem_slugs"
            headline="Public directory curation"
            title="Featured ecosystems"
            description="Choose which published ecosystems appear first on FireUX ecosystem surfaces."
            empty-label="No featured ecosystems selected yet."
            saved-label="Featured ecosystems saved"
            failed-label="Failed to save featured ecosystems"
          >
            <template #default="{ selectedValues, toggleSlug }">
              <UPageCard
                title="Published ecosystems"
                description="Select an ecosystem to add or remove it from the featured list."
                icon="i-lucide-orbit"
                variant="subtle"
              >
                <MoleculesStateCard
                  v-if="directoryOutcome === 'pending'"
                  entity="ecosystems"
                  state="loading"
                  surface="bare"
                />

                <MoleculesStateCard
                  v-else-if="directoryOutcome === 'error'"
                  entity="ecosystems"
                  state="error"
                  surface="bare"
                />

                <MoleculesStateCard
                  v-else-if="directoryOutcome === 'empty'"
                  entity="ecosystems"
                  state="empty"
                  surface="bare"
                />

                <div v-else class="grid gap-3 sm:grid-cols-2">
                  <MoleculesActionSurface
                    v-for="row in selectableRows"
                    :key="row.slug"
                    action
                    :aria-label="`${isSelected(row.slug, selectedValues) ? 'Remove' : 'Feature'} ${row.card.title}`"
                    :class="selectionClass(isSelected(row.slug, selectedValues))"
                    @activate="toggleSlug(row.slug)"
                  >
                    <EcosystemCardsCell
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
  useEcosystemInterface,
  type EcosystemInterfaceCard,
} from 'fireux-core/runtime/composables/fireux/ecosystem/useEcosystemInterface'
import { usePlatformEcosystemDirectory } from '../../../composables/usePlatformDirectory'

const { ecosystems, outcome: directoryOutcome } =
  usePlatformEcosystemDirectory()
const { cell: ecosystemCell } = useEcosystemInterface()
const clean = (value: unknown) => String(value ?? '').trim()

const selectableRows = computed<
  { slug: string; card: EcosystemInterfaceCard }[]
>(() =>
  ecosystems.value
    .map((ecosystem) => {
      const slug = clean(ecosystem.id)
      const card = ecosystemCell({
        ...ecosystem,
        href: ecosystem.detail_url,
        appCount: ecosystem.app_count,
      })
      return slug && card ? { slug, card } : null
    })
    .filter(
      (row): row is { slug: string; card: EcosystemInterfaceCard } =>
        Boolean(row)
    )
    .sort((a, b) => a.card.title.localeCompare(b.card.title))
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
    key: 'ecosystems',
    label: 'Featured ecosystems',
    description:
      'Choose which published ecosystems appear first on public surfaces.',
    icon: 'i-lucide-orbit',
    order: 40,
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: 'Featured ecosystems' })
</script>
