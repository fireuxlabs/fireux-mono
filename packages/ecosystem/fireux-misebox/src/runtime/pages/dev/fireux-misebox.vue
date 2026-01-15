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
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="chefDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setChefDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="chefDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setChefDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ chefDriftKind }}:</span>

          <UButton
            v-for="option in chefFilterOptions"
            :key="option.value"
            size="xs"
            :variant="chefSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="chefSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyChefFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!chefFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching chefs"
            description="Adjust filters or add chef documents to Firestore."
          />

          <UButton
            v-for="card in chefFilteredCards"
            v-else
            :key="card.id"
            color="neutral"
            variant="ghost"
            class="w-full justify-start px-3 py-3"
          >
            <OrganismsProfilesChefCardsPill v-bind="card" />
          </UButton>
        </div>
      </DevPane>

      <DevPane
        title="Chefs (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Misebox · Chefs · All data"
        :debug-data="chefAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        title="Suppliers collection"
        description="Browse suppliers and filter by model drift (SupplierCore)."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="supplierDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setSupplierDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="supplierDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setSupplierDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ supplierDriftKind }}:</span>

          <UButton
            v-for="option in supplierFilterOptions"
            :key="option.value"
            size="xs"
            :variant="supplierSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="supplierSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copySupplierFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!supplierFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching suppliers"
            description="Adjust filters or add supplier documents to Firestore."
          />

          <UButton
            v-for="card in supplierFilteredCards"
            v-else
            :key="card.id"
            color="neutral"
            variant="ghost"
            class="w-full justify-start px-3 py-3"
          >
            <OrganismsProfilesSupplierCardsPill v-bind="card" />
          </UButton>
        </div>
      </DevPane>

      <DevPane
        title="Suppliers (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Misebox · Suppliers · All data"
        :debug-data="supplierAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        title="Kitchens collection"
        description="Browse kitchens and filter by model drift (Kitchen)."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="kitchenDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setKitchenDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="kitchenDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setKitchenDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ kitchenDriftKind }}:</span>

          <UButton
            v-for="option in kitchenFilterOptions"
            :key="option.value"
            size="xs"
            :variant="kitchenSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="kitchenSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyKitchenFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!kitchenFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching kitchens"
            description="Adjust filters or add kitchen documents to Firestore."
          />

          <UButton
            v-for="card in kitchenFilteredCards"
            v-else
            :key="card.id"
            color="neutral"
            variant="ghost"
            class="w-full justify-start px-3 py-3"
          >
            <OrganismsObjectsKitchenCardsCell
              :to="card.to"
              :name="card.name"
              :website="card.website"
              :badges="card.badges"
              :avatar-url="card.avatarUrl"
            />
          </UButton>
        </div>
      </DevPane>

      <DevPane
        title="Kitchens (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Misebox · Kitchens · All data"
        :debug-data="kitchenAllJsonPayload"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import {
  humanizeDriftPath,
  resolveDriftFromModel,
  type DriftKind,
  type ModelDrift,
} from 'fireux-core/runtime/composables/dev/useModelDrift'

import { useChefCollection } from '../../composables/fireux/firestore/profiles/Chef/main/useChefCollection'
import { useChef } from '../../composables/fireux/firestore/profiles/Chef/useChef'
import { ChefCore as ChefCoreRuntime } from '../../models/profiles/Chef/Chef.model'
import type { ChefCore } from '../../models/profiles/Chef/Chef.model'

import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
import { useSupplier } from '../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import { SupplierCore as SupplierCoreRuntime } from '../../models/profiles/Supplier/Supplier.model'
import type { SupplierCore } from '../../models/profiles/Supplier/Supplier.model'

import { useKitchens } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/useKitchens'
import { useKitchenInterface } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import { Kitchen as KitchenModelRuntime } from 'fireux-kitchens/runtime/models/objects/kitchen.model'
import type { Kitchen } from 'fireux-kitchens/runtime/models/objects/kitchen.model'

definePageMeta({
  layout: 'dev',
  alias: [
    '/dev/fireux-misebox',
    '/dev/fireux-misebox-tenant',
  ],
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
const { rawGlobalChefs } = useChefCollection()
const { card: resolveChefCard } = useChef()

const chefCollection = computed<ChefCore[]>(() =>
  (rawGlobalChefs.value ?? []).filter((c: any): c is ChefCore => Boolean(c?.id))
)

const chefCards = computed(() =>
  chefCollection.value
    .map((c) => resolveChefCard(c as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const chefDriftKind = ref<DriftKind>('missing')
const chefSelectedField = ref('')

const setChefDriftKind = (kind: DriftKind) => {
  chefDriftKind.value = kind
}

watch(chefDriftKind, () => {
  chefSelectedField.value = ''
})

const chefDriftById = computed(() => {
  const map = new Map<string, ModelDrift>()
  for (const chef of chefCollection.value) {
    if (!chef?.id) continue
    map.set(
      chef.id,
      resolveDriftFromModel(
        ChefCoreRuntime as unknown as Record<string, unknown>,
        chef as unknown as Record<string, unknown>
      )
    )
  }
  return map
})

const chefFieldOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const drift of chefDriftById.value.values()) {
    const list = chefDriftKind.value === 'missing' ? drift.missing : drift.extra
    for (const field of list) counts.set(field, (counts.get(field) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, label: `${humanizeDriftPath(key)} (${count})` }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const chefFilterOptions = computed(() => [
  { label: 'All', value: '' },
  ...chefFieldOptions.value.map((o) => ({ label: o.label, value: o.key })),
])

const chefFilteredCards = computed(() => {
  if (!chefSelectedField.value) return chefCards.value
  return chefCards.value.filter((card) => {
    const drift = chefDriftById.value.get(card.id)
    if (!drift) return false
    const list = chefDriftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(chefSelectedField.value)
  })
})

const chefFilteredPayload = computed(() =>
  chefFilteredCards.value.map((card) => {
    const drift = chefDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const chefAllJsonPayload = computed(() => ({
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
const { rawGlobalSuppliers } = useSupplierCollection()
const { card: resolveSupplierCard } = useSupplier()

const supplierCollection = computed<SupplierCore[]>(() =>
  (rawGlobalSuppliers.value ?? []).filter((s: any): s is SupplierCore => Boolean(s?.id))
)

const supplierCards = computed(() =>
  supplierCollection.value
    .map((s) => resolveSupplierCard(s as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const supplierDriftKind = ref<DriftKind>('missing')
const supplierSelectedField = ref('')

const setSupplierDriftKind = (kind: DriftKind) => {
  supplierDriftKind.value = kind
}

watch(supplierDriftKind, () => {
  supplierSelectedField.value = ''
})

const supplierDriftById = computed(() => {
  const map = new Map<string, ModelDrift>()
  for (const supplier of supplierCollection.value) {
    if (!supplier?.id) continue
    map.set(
      supplier.id,
      resolveDriftFromModel(
        SupplierCoreRuntime as unknown as Record<string, unknown>,
        supplier as unknown as Record<string, unknown>
      )
    )
  }
  return map
})

const supplierFieldOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const drift of supplierDriftById.value.values()) {
    const list = supplierDriftKind.value === 'missing' ? drift.missing : drift.extra
    for (const field of list) counts.set(field, (counts.get(field) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, label: `${humanizeDriftPath(key)} (${count})` }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const supplierFilterOptions = computed(() => [
  { label: 'All', value: '' },
  ...supplierFieldOptions.value.map((o) => ({ label: o.label, value: o.key })),
])

const supplierFilteredCards = computed(() => {
  if (!supplierSelectedField.value) return supplierCards.value
  return supplierCards.value.filter((card) => {
    const drift = supplierDriftById.value.get(card.id)
    if (!drift) return false
    const list = supplierDriftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(supplierSelectedField.value)
  })
})

const supplierFilteredPayload = computed(() =>
  supplierFilteredCards.value.map((card) => {
    const drift = supplierDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const supplierAllJsonPayload = computed(() => ({
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

const kitchenCards = computed(() =>
  kitchens.value
    .map((k) => resolveKitchenCard(k))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const kitchenDriftKind = ref<DriftKind>('missing')
const kitchenSelectedField = ref('')

const setKitchenDriftKind = (kind: DriftKind) => {
  kitchenDriftKind.value = kind
}

watch(kitchenDriftKind, () => {
  kitchenSelectedField.value = ''
})

const kitchenDriftById = computed(() => {
  const map = new Map<string, ModelDrift>()
  for (const kitchen of kitchens.value) {
    if (!kitchen?.id) continue
    map.set(
      kitchen.id,
      resolveDriftFromModel(
        KitchenModelRuntime as unknown as Record<string, unknown>,
        kitchen as unknown as Record<string, unknown>
      )
    )
  }
  return map
})

const kitchenFieldOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const drift of kitchenDriftById.value.values()) {
    const list = kitchenDriftKind.value === 'missing' ? drift.missing : drift.extra
    for (const field of list) counts.set(field, (counts.get(field) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, label: `${humanizeDriftPath(key)} (${count})` }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const kitchenFilterOptions = computed(() => [
  { label: 'All', value: '' },
  ...kitchenFieldOptions.value.map((o) => ({ label: o.label, value: o.key })),
])

const kitchenFilteredCards = computed(() => {
  if (!kitchenSelectedField.value) return kitchenCards.value
  return kitchenCards.value.filter((card) => {
    const drift = kitchenDriftById.value.get(card.id)
    if (!drift) return false
    const list = kitchenDriftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(kitchenSelectedField.value)
  })
})

const kitchenFilteredPayload = computed(() =>
  kitchenFilteredCards.value.map((card) => {
    const drift = kitchenDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, name: card.name, website: card.website, drift }
  })
)

const kitchenAllJsonPayload = computed(() => ({
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
</script>
