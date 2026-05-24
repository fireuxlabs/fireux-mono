<template>
  <UDashboardPanel id="dashboard-admin-ecosystems">
    <template #header>
      <LayoutsDashboardNavbar title="Admin · Ecosystems" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <EntityIndexCta
              title="Ecosystems"
              description="Manage how FireUX ecosystem records appear on public ecosystem surfaces."
              family="console"
              source="ecosystems"
              :count-label="`${publishedEcosystems.length} active ecosystem${publishedEcosystems.length === 1 ? '' : 's'}`"
              :actions="actions"
            />

            <AdminFeaturedSlugs
              field="featured_ecosystem_slugs"
              title="Featured ecosystem slugs"
              description="One ecosystem slug per line. These slugs control featured ecosystem surfaces."
              :known-slugs="knownSlugs"
              placeholder="fireux&#10;misebox&#10;cleanbox"
            />

            <EcosystemCollectionManager
              :collection="publishedEcosystems"
              title="All ecosystems"
              description="Browse active ecosystem records."
              link
            />
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'
import type { EcosystemSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'ecosystems',
    label: 'Ecosystems',
    description: 'Manage public ecosystem surfaces and featured ecosystem slugs.',
    icon: 'i-lucide-orbit',
    order: 40,
  },
  requiresAuth: true,
  roles: ['admin'],
})

const clean = (value: unknown) => String(value ?? '').trim()
const { ecosystems } = useEcosystemCollection()

const publishedEcosystems = computed<EcosystemSurface[]>(() =>
  (ecosystems.value
    .filter((entry) => clean(entry.status) === 'active')
    .filter((entry) => clean(entry.id) && clean(entry.slug))
    .sort((a, b) => clean(a.name).localeCompare(clean(b.name)))) as EcosystemSurface[]
)

const knownSlugs = computed(() =>
  publishedEcosystems.value.map((entry) => clean(entry.slug)).filter(Boolean)
)

const actions = [
  {
    label: 'Console',
    cta: 'Open ecosystem',
    to: '/console/project/ecosystem',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Public',
    cta: 'View ecosystems',
    to: '/ecosystems',
    icon: 'i-lucide-orbit',
  },
] as const
</script>
