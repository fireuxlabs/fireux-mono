<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Model shape for Apps collection."
    />

    <UPageBody class="pagebody">
      <UCard variant="subtle">
        <div class="text-xs text-muted">
          Mode:
          <span class="font-mono">
            {{ modeLabel }}
          </span>
        </div>
      </UCard>

      <DevBinding :app="bindingApp" :apps="appCollection" />

      <DevModel :title="'Apps · Model'" :model="appModelRuntime" />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Apps collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public apps collection
              manager.
            </p>
            <DevDriftToolbar
              :drift-kind="appsDriftKind"
              :allow-missing="appsAllowMissing"
              :selected-field="appsSelectedField"
              :filter-options="appsFilterOptions"
              :copy-label="'Copy drift · Apps'"
              :copy-payload="appsDriftCopyPayload"
              @update:drift-kind="setAppsDriftKind"
              @update:selected-field="updateAppsSelectedField"
            />
          </div>
        </template>
      </UCard>

      <AppCollectionManager :controller="publicAppsController" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 16:18 CEST — Repo Efficiency Pass 1 of 6: inspect raw Apps through the authenticated dev API across all app roles.
// Concurrent edit — 2026-07-20 17:01 CEST — Demo Data Spine pass: remove redundant non-console App fixtures.
import { definePageMeta } from '#imports'
import { useDevAppCollection } from '../../composables/dev/useDevAppCollection'
import { useDevDriftFilter } from '../../composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useEcosystemAppCollection } from '../../ecosystem/composables/useEcosystemAppCollection'
import { AppDefaults } from '../../app/models/app.model.ts'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 20,
  },
  title: 'Dev · Apps',
  description: 'Developer view for Apps (collection-first).',
})

const appModelRuntime = AppDefaults
const publicAppsController = useEcosystemAppCollection()

const { apps } = useDevAppCollection()

const { appId: configAppId, isTenant, role } = useFireUXConfig()
const appCollection = computed(() =>
  isTenant
    ? apps.value.filter((app) => app.id === configAppId)
    : (apps.value ?? [])
)
const modeLabel = computed(() => {
  if (role === 'tenant') return 'tenant (single app)'
  if (role === 'standalone') return 'standalone (all apps)'
  return 'global (all apps)'
})

const bindingAppId = computed(() => configAppId ?? '')
const bindingApp = computed(
  () =>
    appCollection.value.find((item) => item?.id === bindingAppId.value) ?? null
)

const {
  driftKind: appsDriftKind,
  allowMissing: appsAllowMissing,
  setDriftKind: setAppsDriftKind,
  selectedField: appsSelectedField,
  driftById: appsDriftById,
  filterOptions: appsFilterOptions,
  filteredCollection: filteredApps,
} = useDevDriftFilter({
  collection: appCollection,
  runtimeModel: appModelRuntime,
  driftMode: 'all',
  ignoreExtraTimestampFields: false,
})

const filteredAppsDriftPayload = computed(() =>
  filteredApps.value.map((app) => {
    const drift = appsDriftById.value.get(app.id) ?? { missing: [], extra: [] }
    return {
      id: app.id,
      displayName: app.app_name,
      drift,
    }
  })
)

const appsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/core/fireux-core/src/runtime/app/models/app.model.ts',
  driftKind: appsDriftKind.value,
  selectedField: appsSelectedField.value || null,
  totalApps: filteredApps.value.length,
  apps: filteredAppsDriftPayload.value,
}))

const updateAppsSelectedField = (value: string) => {
  appsSelectedField.value = value
}
</script>
