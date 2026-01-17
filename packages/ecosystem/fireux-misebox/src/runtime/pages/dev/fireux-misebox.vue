<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Collection-first view; filter by missing or extra fields (against the runtime models)."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="Chefs collection"
        description="Browse chefs and filter by model drift (ChefCore)."
      >
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
      </DevPane>

      <DevJson
        title="Chefs (JSON)"
        :data="chefAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        title="Suppliers collection"
        description="Browse suppliers and filter by model drift (SupplierCore)."
      >
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
      </DevPane>

      <DevJson
        title="Suppliers (JSON)"
        :data="supplierAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        title="Kitchens collection"
        description="Browse kitchens and filter by model drift (Kitchen)."
      >
        <DevDriftToolbar
          :drift-kind="kitchenDriftKind"
          :selected-field="kitchenSelectedField"
          :filter-options="kitchenFilterOptions"
          :copy-label="copying ? 'Copying…' : 'Copy drift'"
          :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
          :copy-disabled="copying"
          @update:drift-kind="setKitchenDriftKind"
          @update:selected-field="(value) => (kitchenSelectedField = value)"
          @copy="copyKitchenFiltered"
        />

        <div class="space-y-2">
          <UAlert
            v-if="!kitchenFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching kitchens"
            description="Adjust filters or add kitchen documents to Firestore."
          />

          <div v-else class="grid gap-3 md:grid-cols-2">
            <component
              :is="wrapperFor(card)"
              v-for="card in kitchenFilteredCards"
              :key="card.id"
              v-bind="wrapperPropsFor(card)"
              class="block"
            >
              <KitchenCardsCell v-bind="card" />
            </component>
          </div>
        </div>
      </DevPane>

      <DevJson
        title="Kitchens (JSON)"
        :data="kitchenAllJsonPayload"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import DevDriftToolbar from 'fireux-core/runtime/components/dev/DevDriftToolbar'
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
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

import { useKitchens } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/useKitchens'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from 'fireux-kitchens/runtime/models/objects/kitchen.model'
import { Kitchen as KitchenModelRuntime } from 'fireux-kitchens/runtime/models/objects/kitchen.model'

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
      driftKind: supplierDriftKind.value,
      selectedField: supplierSelectedField.value || null,
      totalSuppliers: supplierCollection.value.length,
      suppliers: supplierFilteredPayload.value,
    },
    { label: 'Dev · Misebox · Suppliers · Filtered drift' }
  )
}

// Kitchens
const { collection: kitchensRaw } = useKitchens<Kitchen>()
const kitchens = computed<Kitchen[]>(() => (kitchensRaw.value ?? []) as Kitchen[])
const { card: resolveKitchenCard } = useKitchenInterface()

const {
  driftKind: kitchenDriftKind,
  setDriftKind: setKitchenDriftKind,
  selectedField: kitchenSelectedField,
  driftById: kitchenDriftById,
  filterOptions: kitchenFilterOptions,
  filteredCollection: kitchenFilteredCollection,
} = useDevDriftFilter({
  collection: kitchens,
  runtimeModel: KitchenModelRuntime as unknown as Record<string, unknown>,
})

const kitchenFilteredCards = computed(() =>
  kitchenFilteredCollection.value
    .map((k) => resolveKitchenCard(k))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const kitchenFilteredPayload = computed(() =>
  kitchenFilteredCards.value.map((card) => {
    const drift = kitchenDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, name: card.name, website: card.website, drift }
  })
)

const kitchenAllJsonPayload = computed(() => ({
  totalKitchens: kitchens.value.length,
  kitchens: kitchens.value,
  driftById: Object.fromEntries(kitchenDriftById.value),
}))

const copyKitchenFiltered = async () => {
  await copyJSON(
    {
      driftKind: kitchenDriftKind.value,
      selectedField: kitchenSelectedField.value || null,
      totalKitchens: kitchens.value.length,
      kitchens: kitchenFilteredPayload.value,
    },
    { label: 'Dev · Misebox · Kitchens · Filtered drift' }
  )
}

const wrapperFor = (card: { to?: string | null }) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: { to?: string | null }) => (card.to ? { to: card.to } : {})
</script>
