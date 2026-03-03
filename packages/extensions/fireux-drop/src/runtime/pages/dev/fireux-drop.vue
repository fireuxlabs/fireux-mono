<template>
  <UPage>
    <UPageHeader
      title="Dev · Drop"
      description="Model shapes for Suppliers in Drop."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Model</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('model')"
            >
              {{ openSections.model ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.model" class="mt-4">
            <DevModel
              :title="'Suppliers · Model'"
              :model="supplierModelRuntime"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Collection</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('collection')"
            >
              {{ openSections.collection ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.collection" class="mt-4">
            <UCard>
              <template #header>
                <div class="space-y-3">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Suppliers collection
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Filter suppliers by model drift (extra fields) before browsing records.
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

            <ProfilesSupplierCollectionManager :collection="filteredSuppliers" />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed, reactive } from 'vue'
import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
import { SupplierCore as SupplierCoreRuntime } from '../../models/profiles/Supplier/Supplier.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-drop',
    label: 'Drop (Ext)',
    icon: 'i-lucide-truck',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const openSections = reactive({
  model: false,
  collection: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

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
  modelPath: 'packages/extensions/fireux-drop/src/runtime/models/profiles/Supplier/Supplier.model',
  driftKind: suppliersDriftKind.value,
  selectedField: suppliersSelectedField.value || null,
  totalSuppliers: suppliersCollection.value.length,
  suppliers: filteredSuppliersDriftPayload.value,
}))

const updateSuppliersSelectedField = (value: string) => {
  suppliersSelectedField.value = value
}
</script>
