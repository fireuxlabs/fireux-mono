<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Model shapes for Suppliers."
    />

    <UPageBody class="pagebody">
      <DevModel
        :title="'Suppliers · Model'"
        :model="supplierModelRuntime"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Suppliers collection
              </p>
              <UBadge variant="soft">{{ visibleSuppliers }} / {{ totalSuppliers }}</UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Filter suppliers by model drift before browsing records.
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
        </template>
      </UCard>

      <OrganismsProfilesSupplierCollectionManager :collection="filteredSuppliers" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
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

const supplierModelRuntime = SupplierCoreRuntime

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

const totalSuppliers = computed(() => suppliersCollection.value.length)
const visibleSuppliers = computed(() => filteredSuppliers.value.length)


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

const updateSuppliersSelectedField = (value: string) => {
  suppliersSelectedField.value = value
}
</script>
