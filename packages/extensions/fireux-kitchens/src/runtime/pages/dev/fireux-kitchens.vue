<template>
  <UPage>
    <UPageHeader
      title="Dev · Kitchens (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Kitchen model)."
    />

    <UPageBody class="space-y-10">
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Kitchens collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse kitchens resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="driftKind"
                :selected-field="selectedField"
                :filter-options="filterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Kitchens'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setDriftKind"
                @update:selected-field="updateSelectedField"
                @copy="copyFiltered"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Kitchens (JSON)'"
            :data="allJsonPayload"
            :default-open="false"
          />
          <DevModel
            :title="'Kitchens · Model'"
            :model="kitchenModelRuntime"
          />
        </template>

        <UAlert
          v-if="!filteredCards.length"
          color="neutral"
          variant="soft"
          icon="i-lucide-inbox"
          title="No matching kitchens"
          description="Adjust filters or add kitchen documents to Firestore."
        />

        <div v-else class="grid gap-3 md:grid-cols-2">
          <component
            :is="wrapperFor(card)"
            v-for="card in filteredCards"
            :key="card.id"
            v-bind="wrapperPropsFor(card)"
            class="block"
          >
            <KitchenCardsCell
              v-bind="card"
              :prop="taglineById.get(card.id) || ''"
            />
          </component>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftCopyMeta } from 'fireux-core/runtime/composables/dev/useDevDriftCopyMeta'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useKitchens } from '../../composables/fireux/firestore/objects/kitchen/useKitchens'
import { useKitchenInterface } from '../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import type { Kitchen as KitchenModel } from '../../models/objects/kitchen.model'
import { Kitchen as KitchenModelRuntime } from '../../models/objects/kitchen.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-kitchens',
    label: 'Kitchens (Ext)',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { copyJSON, copying } = useDevClipboard()
const driftMeta = useDevDriftCopyMeta()
const { card: makeCard } = useKitchenInterface()

const { collection } = useKitchens<KitchenModel>()
const kitchenList = computed<KitchenModel[]>(() => (collection.value ?? []) as KitchenModel[])
const kitchenModelRuntime = KitchenModelRuntime as unknown as Record<string, unknown>

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
  filteredCollection,
} = useDevDriftFilter({
  collection: kitchenList,
  runtimeModel: kitchenModelRuntime,
})

const filteredCards = computed(() =>
  filteredCollection.value
    .map((kitchen) => makeCard(kitchen))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const taglineById = computed(() => {
  const map = new Map<string, string>()
  for (const card of filteredCards.value) {
    const drift = driftById.value.get(card.id)
    if (!drift) continue
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra

    const selected = selectedField.value
    if (selected && list.includes(selected)) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${selected}`)
      continue
    }

    const first = list[0]
    if (first) {
      map.set(card.id, `${driftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${first}`)
    }
  }
  return map
})

const filteredPayload = computed(() =>
  filteredCards.value.map((card) => {
    const drift = driftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      website: card.website,
      drift,
    }
  })
)

const allJsonPayload = computed(() => ({
  totalKitchens: kitchenList.value.length,
  kitchens: kitchenList.value,
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      meta: driftMeta,
      runtimeModel: kitchenModelRuntime,
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      totalKitchens: kitchenList.value.length,
      kitchens: filteredPayload.value,
    },
    { label: 'Dev · Kitchens (Ext) · Filtered drift' }
  )
}

const updateSelectedField = (value: string) => {
  selectedField.value = value
}

const wrapperFor = (card: { to?: string | null }) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string | null }) => (card.to ? { to: card.to } : {})
</script>
