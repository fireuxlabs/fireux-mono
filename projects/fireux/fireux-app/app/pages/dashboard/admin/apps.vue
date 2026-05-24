<template>
  <UDashboardPanel id="dashboard-admin-apps">
    <template #header>
      <LayoutsDashboardNavbar title="Admin · Apps" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <EntityIndexCta
              title="Apps"
              description="Manage how FireUX app records appear on public app surfaces."
              family="console"
              source="apps"
              :count-label="`${publishedApps.length} active app${publishedApps.length === 1 ? '' : 's'}`"
              :actions="actions"
            />

            <AdminFeaturedSlugs
              field="featured_app_slugs"
              title="Featured app slugs"
              description="One app slug per line. These slugs control featured app surfaces."
              :known-slugs="knownSlugs"
              placeholder="go-qr&#10;sproochli&#10;buenohost"
            />

            <AppCollectionManager
              :collection="publishedApps"
              title="All apps"
              description="Browse active app records."
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
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import type { AppModel } from 'fireux-core/runtime/models/core/app.model'

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'apps',
    label: 'Apps',
    description: 'Manage public app surfaces and featured app slugs.',
    icon: 'i-lucide-app-window',
    order: 30,
  },
  requiresAuth: true,
  roles: ['admin'],
})

const clean = (value: unknown) => String(value ?? '').trim()
const { apps } = useAppCollection()

const publishedApps = computed<AppModel[]>(() =>
  ((apps.value ?? [])
    .filter((entry) => clean(entry.status) === 'active')
    .filter((entry) => clean(entry.id) && clean(entry.slug))
    .sort((a, b) => clean(a.app_name).localeCompare(clean(b.app_name)))) as AppModel[]
)

const knownSlugs = computed(() =>
  publishedApps.value.map((entry) => clean(entry.slug)).filter(Boolean)
)

const actions = [
  {
    label: 'Console',
    cta: 'Open apps',
    to: '/console/project/apps',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Public',
    cta: 'View apps',
    to: '/apps',
    icon: 'i-lucide-app-window',
  },
] as const
</script>
