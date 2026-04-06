<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Model shape for Apps collection."
    />

    <UPageBody class="pagebody">
      <UCard variant="subtle">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Mode:
          <span class="font-mono">
            {{ modeLabel }}
          </span>
        </div>
      </UCard>

      <DevBinding :app="bindingApp" :apps="appCollection" />

      <DevAppDemo />

      <DevModel
        :title="'Apps · Model'"
        :model="appModelRuntime"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Apps collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Filter apps by model drift (missing + extra fields) before browsing records.
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

      <AppCollectionManager :collection="filteredApps" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { AppModel as AppModelRuntime } from '../../models/core/app.model'

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

const appModelRuntime = AppModelRuntime

const { apps } = useAppCollection()
const { app: activeApp } = useApp()

const { appId: configAppId, isTenant, role } = useFireUXConfig()
const appCollection = computed(() =>
  isTenant ? (activeApp.value ? [activeApp.value] : []) : apps.value ?? []
)
const modeLabel = computed(() => {
  if (role === 'tenant') return 'tenant (single app)'
  if (role === 'standalone') return 'standalone (all apps)'
  return 'global (all apps)'
})

const bindingAppId = computed(() => configAppId ?? '')
const bindingApp = computed(() =>
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
  modelPath: 'packages/core/fireux-core/src/runtime/models/core/app.model.ts',
  driftKind: appsDriftKind.value,
  selectedField: appsSelectedField.value || null,
  totalApps: filteredApps.value.length,
  apps: filteredAppsDriftPayload.value,
}))

const updateAppsSelectedField = (value: string) => {
  appsSelectedField.value = value
}
</script>
