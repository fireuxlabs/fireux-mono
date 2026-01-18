<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Collection-first view; filter by missing or extra fields (against the runtime models)."
    />

    <UPageBody class="space-y-10">
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Chefs collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse chefs and filter by model drift (ChefCore).
              </p>
              <DevDriftToolbar
                :drift-kind="chefDriftKind"
                :selected-field="chefSelectedField"
                :filter-options="chefFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setChefDriftKind"
                @update:selected-field="(value) => (chefSelectedField = value)"
                @copy="copyChefFiltered"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Chefs (JSON)'"
            :data="chefAllJsonPayload"
            :default-open="false"
          />
          <DevModel
            :title="'Chefs · Model'"
            :model="ChefCoreRuntime as unknown as Record<string, unknown>"
          />
        </template>

        <div class="space-y-2">
          <UAlert
            v-if="!chefFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching chefs"
            description="Adjust filters or add chef documents to Firestore."
          />

          <OrganismsProfilesChefCollectionList
            v-else
            :cards="chefFilteredCards"
            variant="pill"
          />
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Suppliers collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse suppliers and filter by model drift (SupplierCore).
              </p>
              <DevDriftToolbar
                :drift-kind="supplierDriftKind"
                :selected-field="supplierSelectedField"
                :filter-options="supplierFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setSupplierDriftKind"
                @update:selected-field="(value) => (supplierSelectedField = value)"
                @copy="copySupplierFiltered"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Suppliers (JSON)'"
            :data="supplierAllJsonPayload"
            :default-open="false"
          />
          <DevModel
            :title="'Suppliers · Model'"
            :model="SupplierCoreRuntime as unknown as Record<string, unknown>"
          />
        </template>

        <div class="space-y-2">
          <UAlert
            v-if="!supplierFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching suppliers"
            description="Adjust filters or add supplier documents to Firestore."
          />

          <OrganismsProfilesSupplierCollectionList
            v-else
            :cards="supplierFilteredCards"
            variant="pill"
          />
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

import { useChefCollection } from '../../composables/fireux/firestore/profiles/Chef/main/useChefCollection'
import { useChef } from '../../composables/fireux/firestore/profiles/Chef/useChef'
import type { ChefCore } from '../../models/profiles/Chef/Chef.model'
import { ChefCore as ChefCoreRuntime } from '../../models/profiles/Chef/Chef.model'

import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
import { useSupplier } from '../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import type { SupplierCore } from '../../models/profiles/Supplier/Supplier.model'
import { SupplierCore as SupplierCoreRuntime } from '../../models/profiles/Supplier/Supplier.model'


definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-misebox',
    label: 'Misebox',
    icon: 'i-lucide-utensils-crossed',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

const { copyJSON, copying } = useDevClipboard()
const driftMeta = useDevDriftCopyMeta()

// Chefs
const { rawGlobalChefs, globalChefs } = useChefCollection()
const { card: resolveChefCard } = useChef()

type ChefEntryWithUser = ChefCore & { user?: any }

const chefEntriesWithUser = computed<ChefEntryWithUser[]>(() =>
  (globalChefs.value ?? []).filter((c: any): c is ChefEntryWithUser => Boolean(c?.id))
)

// Drift should be computed against the core model only (ignore attached `user`).
const chefCollection = computed<ChefCore[]>(() =>
  (rawGlobalChefs.value ?? []).filter((c: any): c is ChefCore => Boolean(c?.id))
)

const chefUserById = computed(() => {
  const map = new Map<string, any>()
  for (const entry of chefEntriesWithUser.value) {
    if (!entry?.id) continue
    map.set(entry.id, entry.user)
  }
  return map
})

const {
  driftKind: chefDriftKind,
  setDriftKind: setChefDriftKind,
  selectedField: chefSelectedField,
  driftById: chefDriftById,
  filterOptions: chefFilterOptions,
  filteredCollection: chefFilteredCollection,
} = useDevDriftFilter({
  collection: chefCollection,
  runtimeModel: ChefCoreRuntime as unknown as Record<string, unknown>,
})

const chefFilteredCards = computed(() =>
  chefFilteredCollection.value
    .map((c) => resolveChefCard(c as any, chefUserById.value.get(c.id) ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const chefFilteredPayload = computed(() =>
  chefFilteredCards.value.map((card) => {
    const drift = chefDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      title: card.tagline,
      drift,
    }
  })
)

const chefAllJsonPayload = computed(() => ({
  totalChefs: chefCollection.value.length,
  chefs: chefCollection.value,
  driftById: Object.fromEntries(chefDriftById.value),
}))

const copyChefFiltered = async () => {
  await copyJSON(
    {
      meta: driftMeta,
      runtimeModel: ChefCoreRuntime as unknown as Record<string, unknown>,
      driftKind: chefDriftKind.value,
      selectedField: chefSelectedField.value || null,
      totalChefs: chefCollection.value.length,
      chefs: chefFilteredPayload.value,
    },
    { label: 'Dev · Misebox · Chefs · Filtered drift' }
  )
}

// Suppliers
const { rawGlobalSuppliers, globalSuppliers } = useSupplierCollection()
const { card: resolveSupplierCard } = useSupplier()

type SupplierEntryWithUser = SupplierCore & { user?: any }

const supplierEntriesWithUser = computed<SupplierEntryWithUser[]>(() =>
  (globalSuppliers.value ?? []).filter((s: any): s is SupplierEntryWithUser => Boolean(s?.id))
)

// Drift should be computed against the core model only (ignore attached `user`).
const supplierCollection = computed<SupplierCore[]>(() =>
  (rawGlobalSuppliers.value ?? []).filter((s: any): s is SupplierCore => Boolean(s?.id))
)

const supplierUserById = computed(() => {
  const map = new Map<string, any>()
  for (const entry of supplierEntriesWithUser.value) {
    if (!entry?.id) continue
    map.set(entry.id, entry.user)
  }
  return map
})

const {
  driftKind: supplierDriftKind,
  setDriftKind: setSupplierDriftKind,
  selectedField: supplierSelectedField,
  driftById: supplierDriftById,
  filterOptions: supplierFilterOptions,
  filteredCollection: supplierFilteredCollection,
} = useDevDriftFilter({
  collection: supplierCollection,
  runtimeModel: SupplierCoreRuntime as unknown as Record<string, unknown>,
})

const supplierFilteredCards = computed(() =>
  supplierFilteredCollection.value
    .map((s) => resolveSupplierCard(s as any, supplierUserById.value.get(s.id) ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const supplierFilteredPayload = computed(() =>
  supplierFilteredCards.value.map((card) => {
    const drift = supplierDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const supplierAllJsonPayload = computed(() => ({
  totalSuppliers: supplierCollection.value.length,
  suppliers: supplierCollection.value,
  driftById: Object.fromEntries(supplierDriftById.value),
}))

const copySupplierFiltered = async () => {
  await copyJSON(
    {
      meta: driftMeta,
      runtimeModel: SupplierCoreRuntime as unknown as Record<string, unknown>,
      driftKind: supplierDriftKind.value,
      selectedField: supplierSelectedField.value || null,
      totalSuppliers: supplierCollection.value.length,
      suppliers: supplierFilteredPayload.value,
    },
    { label: 'Dev · Misebox · Suppliers · Filtered drift' }
  )
}


const wrapperFor = (card: { to?: string | null }) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string | null }) => (card.to ? { to: card.to } : {})
</script>
