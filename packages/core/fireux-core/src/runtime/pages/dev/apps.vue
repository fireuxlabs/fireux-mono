<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Model shape for Apps collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Apps · Model'"
          :model="appModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Apps collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse apps resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="appsDriftKind"
                :selected-field="appsSelectedField"
                :filter-options="appsFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Apps'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setAppsDriftKind"
                @update:selected-field="updateAppsSelectedField"
                @copy="copyAppsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Apps (JSON)'"
            :data="allAppsJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsAppCollectionManager
          :cards="cards"
          :total="total"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard';
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter';
import { computed } from 'vue';
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection';
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface';
import { App as AppModelRuntime } from '../../models/core/app.model';

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

const { apps, count } = useAppCollection()
const { card: makeCard } = useAppInterface()

const appCollection = computed(() => apps.value ?? [])

const {
  driftKind: appsDriftKind,
  setDriftKind: setAppsDriftKind,
  selectedField: appsSelectedField,
  driftById: appsDriftById,
  filterOptions: appsFilterOptions,
  filteredCollection: filteredApps,
} = useDevDriftFilter({
  collection: appCollection,
  runtimeModel: appModelRuntime,
})

const cards = computed(() =>
  filteredApps.value
    .map((app) => makeCard(app))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => count.value ?? cards.value.length)

const allAppsJsonPayload = computed(() => ({
  totalApps: appCollection.value.length,
  apps: appCollection.value,
}))

const filteredAppsDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = appsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyAppsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/core/fireux-core/src/runtime/models/core/app.model.ts',
      driftKind: appsDriftKind.value,
      selectedField: appsSelectedField.value || null,
      totalApps: total.value,
      apps: filteredAppsDriftPayload.value,
    },
    { label: 'Dev · Apps · Filtered drift' }
  )
}

const updateAppsSelectedField = (value: string) => {
  appsSelectedField.value = value
}
</script>
