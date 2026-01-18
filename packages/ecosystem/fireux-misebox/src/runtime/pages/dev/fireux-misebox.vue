<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Model shapes for Chefs and Suppliers."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Chefs · Model'"
          :model="chefModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Chefs collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse chefs resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="chefsDriftKind"
                :selected-field="chefsSelectedField"
                :filter-options="chefsFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Chefs'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setChefsDriftKind"
                @update:selected-field="updateChefsSelectedField"
                @copy="copyChefsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Chefs (JSON)'"
            :data="allChefsJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsProfilesChefCollectionManager :cards="chefCards" />
      </UCard>

      <UCard>
        <DevModel
          :title="'Suppliers · Model'"
          :model="supplierModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Suppliers collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse suppliers resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="suppliersDriftKind"
                :selected-field="suppliersSelectedField"
                :filter-options="suppliersFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Suppliers'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setSuppliersDriftKind"
                @update:selected-field="updateSuppliersSelectedField"
                @copy="copySuppliersDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Suppliers (JSON)'"
            :data="allSuppliersJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsProfilesSupplierCollectionManager :cards="supplierCards" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useChefCollection } from '../../composables/fireux/firestore/profiles/Chef/main/useChefCollection'
import { useChef } from '../../composables/fireux/firestore/profiles/Chef/useChef'
import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
import { useSupplier } from '../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import { ChefCore as ChefCoreRuntime } from '../../models/profiles/Chef/Chef.model'
import type { ChefCore } from '../../models/profiles/Chef/Chef.model'
import { SupplierCore as SupplierCoreRuntime } from '../../models/profiles/Supplier/Supplier.model'
import type { SupplierCore } from '../../models/profiles/Supplier/Supplier.model'

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

const chefModelRuntime = ChefCoreRuntime
const supplierModelRuntime = SupplierCoreRuntime

const { globalChefs, localChefs } = useChefCollection()
const { card: makeChefCard } = useChef()

const chefsCollection = computed(() => [
  ...(localChefs?.value ?? []),
  ...(globalChefs.value ?? []),
])

const {
  driftKind: chefsDriftKind,
  setDriftKind: setChefsDriftKind,
  selectedField: chefsSelectedField,
  driftById: chefsDriftById,
  filterOptions: chefsFilterOptions,
  filteredCollection: filteredChefs,
} = useDevDriftFilter({
  collection: chefsCollection,
  runtimeModel: chefModelRuntime,
})

const chefCards = computed(() => {
  return filteredChefs.value
    .map((entry) => makeChefCard(entry as ChefCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
})

const allChefsJsonPayload = computed(() => ({
  totalChefs: chefsCollection.value.length,
  chefs: chefsCollection.value,
}))

const filteredChefsDriftPayload = computed(() =>
  chefCards.value.map((card) => {
    const drift = chefsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const { globalSuppliers, localSuppliers } = useSupplierCollection()
const { card: makeSupplierCard } = useSupplier()

const suppliersCollection = computed(() => [
  ...(localSuppliers?.value ?? []),
  ...(globalSuppliers.value ?? []),
])

const {
  driftKind: suppliersDriftKind,
  setDriftKind: setSuppliersDriftKind,
  selectedField: suppliersSelectedField,
  driftById: suppliersDriftById,
  filterOptions: suppliersFilterOptions,
  filteredCollection: filteredSuppliers,
} = useDevDriftFilter({
  collection: suppliersCollection,
  runtimeModel: supplierModelRuntime,
})

const supplierCards = computed(() => {
  return filteredSuppliers.value
    .map((entry) => makeSupplierCard(entry as SupplierCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
})

const allSuppliersJsonPayload = computed(() => ({
  totalSuppliers: suppliersCollection.value.length,
  suppliers: suppliersCollection.value,
}))

const filteredSuppliersDriftPayload = computed(() =>
  supplierCards.value.map((card) => {
    const drift = suppliersDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyChefsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts',
      driftKind: chefsDriftKind.value,
      selectedField: chefsSelectedField.value || null,
      totalChefs: chefsCollection.value.length,
      chefs: filteredChefsDriftPayload.value,
    },
    { label: 'Dev · Chefs · Filtered drift' }
  )
}

const copySuppliersDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts',
      driftKind: suppliersDriftKind.value,
      selectedField: suppliersSelectedField.value || null,
      totalSuppliers: suppliersCollection.value.length,
      suppliers: filteredSuppliersDriftPayload.value,
    },
    { label: 'Dev · Suppliers · Filtered drift' }
  )
}

const updateChefsSelectedField = (value: string) => {
  chefsSelectedField.value = value
}

const updateSuppliersSelectedField = (value: string) => {
  suppliersSelectedField.value = value
}
</script>
