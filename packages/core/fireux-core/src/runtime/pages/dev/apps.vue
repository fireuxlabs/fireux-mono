<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Collection-first view; filter by missing or extra fields (against the runtime model)."
    />

    <UPageBody class="space-y-10">
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                App collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse apps resolved for this runtime.
              </p>
              <DevDriftToolbar
                :drift-kind="driftKind"
                :selected-field="selectedField"
                :filter-options="filterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Apps'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setDriftKind"
                @update:selected-field="updateSelectedField"
                @copy="copyFiltered"
              />
            </div>
          </div>
        </template>
        <OrganismsAppCollectionManager
          :cards="filteredCards"
          :total="viewedCollection.length"
        />
        <template #footer>
          <DevJson
            :title="'Dev · Apps · All data'"
            :data="allJsonPayload"
            :default-open="false"
          />
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta, useRoute } from '#imports'
import { computed } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'
import { useDevDriftFilter } from '../../composables/dev/useDevDriftFilter'
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import type { AppCard } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App as AppModel } from '../../models/core/app.model'
import { App as AppModelRuntime } from '../../models/core/app.model'

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

const route = useRoute()
const appIdFilter = computed(() =>
  typeof route.query.appId === 'string' ? route.query.appId : ''
)

const { apps: appCollectionRaw } = useAppCollection()
const { card: makeCard } = useAppInterface()
const appCollection = computed<AppModel[]>(() => appCollectionRaw.value ?? [])
const viewedCollection = computed<AppModel[]>(() =>
  appIdFilter.value
    ? appCollection.value.filter((app) => app.id === appIdFilter.value)
    : appCollection.value
)

const { copyJSON, copying } = useDevClipboard()

const appModelRuntime = AppModelRuntime as unknown as Record<string, unknown>

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
  filteredCollection,
} = useDevDriftFilter({
  collection: viewedCollection,
  runtimeModel: AppModelRuntime as unknown as Record<string, unknown>,
})

const filteredCards = computed<AppCard.Card[]>(() =>
  filteredCollection.value
    .map((app) => makeCard(app))
    .filter((c): c is AppCard.Card => Boolean(c))
)

const filteredDriftPayload = computed(() =>
  filteredCards.value.map((card) => {
    const drift = driftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      shortName: card.shortName,
      ecosystem: card.ecosystem,
      drift,
    }
  })
)

const allJsonPayload = computed(() => ({
  totalApps: viewedCollection.value.length,
  apps: viewedCollection.value,
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      totalApps: viewedCollection.value.length,
      apps: filteredDriftPayload.value,
    },
    { label: 'Dev · Apps · Filtered drift' }
  )
}

const updateSelectedField = (value: string) => {
  selectedField.value = value
}
</script>
