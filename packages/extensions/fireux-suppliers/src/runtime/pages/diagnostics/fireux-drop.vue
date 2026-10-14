<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Drop"
      description="Model shapes for Suppliers in Drop."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Model</div>
            <UButton variant="ghost" size="xs" @click="toggleSection('model')">
              {{ openSections.model ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.model" class="mt-4">
            <DiagnosticsModel
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
                  <p class="text-sm font-semibold text-highlighted">
                    Suppliers collection
                  </p>
                  <p class="text-xs text-muted">
                    Filter suppliers by model drift (extra fields) before
                    browsing records.
                  </p>
                  <DiagnosticsDriftToolbar
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

            <DiagnosticsDebugPanel
              object-origin="fetched"
              launcher
              include-route
              title="Root Suppliers (JSON)"
              context="dev suppliers · filtered root collection"
              :objects="filteredSuppliers"
              :derived="{}"
              :default-open="false"
              :hide-when-empty="false"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Storage</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('storage')"
            >
              {{ openSections.storage ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.storage" class="mt-4 space-y-4">
            <div class="space-y-3">
              <p class="text-xs text-muted">
                Inspect one Supplier root and its owned operation paths.
              </p>

              <USelect
                v-model="selectedSupplierId"
                :options="supplierOptions"
                placeholder="Select a supplier"
              />
            </div>

            <div class="grid gap-2 md:grid-cols-3">
              <UBadge variant="soft">
                root doc: {{ selectedRootSupplier ? 'yes' : 'no' }}
              </UBadge>
              <UBadge variant="soft"> Team: supplier-owned </UBadge>
              <UBadge variant="soft">
                operations: catalogue, ingredients, items
              </UBadge>
            </div>

            <UAlert
              color="neutral"
              variant="soft"
              title="Supplier owns its Workspace data"
              description="Team, catalogue, ingredients, and items live beneath the canonical Supplier root. Apps do not own Supplier records."
            />

            <DiagnosticsDebugPanel
              object-origin="fetched"
              launcher
              include-route
              title="Supplier storage (JSON)"
              context="dev suppliers · full storage picture"
              :objects="supplierStorageJson"
              :derived="{}"
              :default-open="false"
              :hide-when-empty="false"
            />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed, reactive, ref, watch } from 'vue'
import { useSupplierCollection } from '../../supplier/composables/useSupplierCollection'
import { SupplierDefaults as SupplierModelRuntime } from '../../supplier/models/Supplier.model.ts'

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-drop',
    label: 'Drop (Ext)',
    icon: 'i-lucide-truck',
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})

const openSections = reactive({
  model: false,
  collection: false,
  storage: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

const supplierModelRuntime = SupplierModelRuntime

const { suppliers } = useSupplierCollection()
const suppliersCollection = computed(() => suppliers.value ?? [])
const rootSupplierById = computed(() => {
  const map = new Map<string, (typeof suppliersCollection.value)[number]>()
  for (const supplier of suppliersCollection.value) {
    const id = String(supplier?.id || '').trim()
    if (!id) continue
    map.set(id, supplier)
  }
  return map
})

const {
  driftKind: suppliersDriftKind,
  setDriftKind: setSuppliersDriftKind,
  selectedField: suppliersSelectedField,
  driftById: suppliersDriftById,
  filterOptions: suppliersFilterOptions,
  filteredCollection: filteredSuppliers,
} = useDiagnosticsDriftFilter({
  collection: suppliersCollection,
  runtimeModel: supplierModelRuntime,
})

const filteredSuppliersDriftPayload = computed(() =>
  filteredSuppliers.value.map((entry) => {
    const drift = suppliersDriftById.value.get(String(entry.id || '')) ?? {
      missing: [],
      extra: [],
    }
    return {
      id: entry.id,
      displayName:
        (entry as any)?.display_name ??
        (entry as any)?.handle ??
        entry.id ??
        '',
      drift,
    }
  })
)

const suppliersDriftCopyPayload = computed(() => ({
  modelPath:
    'packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model',
  driftKind: suppliersDriftKind.value,
  selectedField: suppliersSelectedField.value || null,
  totalSuppliers: suppliersCollection.value.length,
  suppliers: filteredSuppliersDriftPayload.value,
}))

const updateSuppliersSelectedField = (value: string) => {
  suppliersSelectedField.value = value
}

const selectedSupplierId = ref('')

const supplierOptions = computed(() =>
  suppliersCollection.value.map((supplier) => {
    const id = String(supplier.id || '').trim()
    const labelBase =
      String((supplier as any)?.company_place?.short_name || '').trim() ||
      String((supplier as any)?.company_place?.name || '').trim() ||
      id
    return {
      label: labelBase,
      value: id,
    }
  })
)

watch(
  supplierOptions,
  (options) => {
    if (!options.length) {
      selectedSupplierId.value = ''
      return
    }

    const stillExists = options.some(
      (option) => option.value === selectedSupplierId.value
    )
    if (!stillExists) {
      selectedSupplierId.value = String(options[0]?.value || '')
    }
  },
  { immediate: true }
)

const selectedRootSupplier = computed(
  () => rootSupplierById.value.get(selectedSupplierId.value) ?? null
)

const supplierStorageJson = computed(() => ({
  selectedSupplierId: selectedSupplierId.value || null,
  paths: {
    rootSupplierCollection: 'suppliers',
    selectedRootSupplierDoc: selectedSupplierId.value
      ? `suppliers/${selectedSupplierId.value}`
      : null,
    teamCollection: selectedSupplierId.value
      ? `suppliers/${selectedSupplierId.value}/team`
      : null,
    catalogueCollection: selectedSupplierId.value
      ? `suppliers/${selectedSupplierId.value}/catalogues`
      : null,
    ingredientCollection: selectedSupplierId.value
      ? `suppliers/${selectedSupplierId.value}/ingredients`
      : null,
    itemCollection: selectedSupplierId.value
      ? `suppliers/${selectedSupplierId.value}/items`
      : null,
  },
  rootSupplier: selectedRootSupplier.value,
  operations: ['catalogues', 'ingredients', 'items'],
}))
</script>
