<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Model shapes for Chefs and Suppliers."
    />

    <UPageBody class="pagebody">
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
                :copy-label="'Copy drift · Chefs'"
                :copy-payload="chefsDriftCopyPayload"
                @update:drift-kind="setChefsDriftKind"
                @update:selected-field="updateChefsSelectedField"
              />
            </div>
          </div>
        </template>

        <OrganismsProfilesChefCollectionManager :collection="filteredChefs" />
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
                :copy-label="'Copy drift · Suppliers'"
                :copy-payload="suppliersDriftCopyPayload"
                @update:drift-kind="setSuppliersDriftKind"
                @update:selected-field="updateSuppliersSelectedField"
              />
            </div>
          </div>
        </template>

        <OrganismsProfilesSupplierCollectionManager :collection="filteredSuppliers" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useChefCollection } from '../../composables/fireux/firestore/profiles/Chef/main/useChefCollection'
import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
import { ChefCore as ChefCoreRuntime } from '../../models/profiles/Chef/Chef.model'
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

const chefModelRuntime = ChefCoreRuntime
const supplierModelRuntime = SupplierCoreRuntime

const { coreChefs, appChefs } = useChefCollection()

const chefsCollection = computed(() => [
  ...(appChefs?.value ?? []),
  ...(coreChefs.value ?? []),
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


const filteredChefsDriftPayload = computed(() =>
  filteredChefs.value.map((entry) => {
    const drift = chefsDriftById.value.get(entry.id) ?? { missing: [], extra: [] }
    return {
      id: entry.id,
      displayName:
        (entry as any)?.display_name ??
        (entry as any)?.handle ??
        entry.id ?? '',
      drift,
    }
  })
)

const chefsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts',
  driftKind: chefsDriftKind.value,
  selectedField: chefsSelectedField.value || null,
  totalChefs: chefsCollection.value.length,
  chefs: filteredChefsDriftPayload.value,
}))

const { coreSuppliers, appSuppliers } = useSupplierCollection()

const suppliersCollection = computed(() => [
  ...(appSuppliers?.value ?? []),
  ...(coreSuppliers.value ?? []),
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


const filteredSuppliersDriftPayload = computed(() =>
  filteredSuppliers.value.map((entry) => {
    const drift = suppliersDriftById.value.get(entry.id) ?? { missing: [], extra: [] }
    return {
      id: entry.id,
      displayName:
        (entry as any)?.display_name ??
        (entry as any)?.handle ??
        entry.id ?? '',
      drift,
    }
  })
)

const suppliersDriftCopyPayload = computed(() => ({
  modelPath: 'packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts',
  driftKind: suppliersDriftKind.value,
  selectedField: suppliersSelectedField.value || null,
  totalSuppliers: suppliersCollection.value.length,
  suppliers: filteredSuppliersDriftPayload.value,
}))

const updateChefsSelectedField = (value: string) => {
  chefsSelectedField.value = value
}

const updateSuppliersSelectedField = (value: string) => {
  suppliersSelectedField.value = value
}
</script>
