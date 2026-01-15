<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Collection-first view; filter by missing or extra fields (against the runtime model)."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="App collection"
        description="Browse apps resolved for this runtime and filter by model drift."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">
            Filter {{ driftKind }}:
          </span>

          <UButton
            v-for="option in filterOptions"
            :key="option.value"
            size="xs"
            :variant="selectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="selectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <OrganismsAppCollectionManager
          :cards="filteredCards"
          :total="viewedCollection.length"
        />
      </DevPane>

      <DevPane
        title="Apps (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Apps · All data"
        :debug-data="allJsonPayload"
        :default-open="false"
      />
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
  alias: ['/dev/apps'],
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
const { copyJSON, copying } = useDevClipboard()

const appCollection = computed<AppModel[]>(() => appCollectionRaw.value ?? [])
const viewedCollection = computed<AppModel[]>(() =>
  appIdFilter.value
    ? appCollection.value.filter((app) => app.id === appIdFilter.value)
    : appCollection.value
)

const appCards = computed<AppCard.Card[]>(() =>
  viewedCollection.value
    .map((app) => makeCard(app))
    .filter((c): c is AppCard.Card => Boolean(c))
)

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
} = useDevDriftFilter({
  collection: viewedCollection,
  runtimeModel: AppModelRuntime as unknown as Record<string, unknown>,
})

const filteredCards = computed<AppCard.Card[]>(() => {
  if (!selectedField.value) return appCards.value

  return appCards.value.filter((card) => {
    const drift = driftById.value.get(card.id)
    if (!drift) return false
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(selectedField.value)
  })
})

const filteredPayload = computed(() =>
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
  appIdFilter: appIdFilter.value || null,
  apps: viewedCollection.value,
  driftById: Object.fromEntries(driftById.value),
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      appIdFilter: appIdFilter.value || null,
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      apps: filteredPayload.value,
    },
    { label: 'Dev · Apps · Filtered drift' }
  )
}
</script>
