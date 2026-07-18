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
                  <p class="text-xs text-muted">
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

            <DevJson
              title="Root Suppliers (JSON)"
              context="dev suppliers · filtered root collection"
              :data="filteredSuppliers"
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
                Inspect one supplier across root and app overlay to catch schema drift or missing console state.
              </p>

              <USelect
                v-model="selectedSupplierId"
                :options="supplierOptions"
                placeholder="Select a supplier"
              />
            </div>

            <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <UBadge variant="soft">
                appId: {{ resolvedAppId || 'missing' }}
              </UBadge>
              <UBadge variant="soft">
                root doc: {{ selectedRootSupplier ? 'yes' : 'no' }}
              </UBadge>
              <UBadge variant="soft">
                app overlay: {{ selectedAppSupplier ? 'yes' : 'no' }}
              </UBadge>
              <UBadge variant="soft">
                child families: none defined
              </UBadge>
            </div>

            <div
              v-if="!selectedAppSupplier && selectedSupplierId"
              class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900"
            >
              No app overlay found at
              <code>{{ overlaySupplierCollectionPath }}/{{ selectedSupplierId }}</code>.
            </div>

            <UAlert
              color="neutral"
              variant="soft"
              title="Supplier child collections are not canon-shaped yet"
              description="Current supplier canon only requires root supplier identity and the app overlay. If child families emerge later, add them here deliberately."
            />

            <DevJson
              title="Supplier storage (JSON)"
              context="dev suppliers · full storage picture"
              :data="supplierStorageJson"
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevStorageCollection } from 'fireux-core/runtime/composables/dev/useDevStorageCollection'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed, reactive, ref, watch } from 'vue'
import { useSupplierCollection } from '../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import type { AppSupplier, Supplier } from '../../models/supplier/Supplier.model'
import { SupplierModel as SupplierModelRuntime } from '../../models/supplier/Supplier.model'

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
  storage: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

const supplierModelRuntime = SupplierModelRuntime

const { suppliers } = useSupplierCollection()
const { appId } = useFireUXConfig()
const resolvedAppId = computed(() => String(appId || '').trim())
const overlaySupplierCollectionPath = computed(() =>
  resolvedAppId.value ? `apps/${resolvedAppId.value}/suppliers` : ''
)
const supplierAppsState = useDevStorageCollection<AppSupplier>(overlaySupplierCollectionPath)
const supplierApps = computed(() => supplierAppsState.items.value)

const suppliersCollection = computed(() => suppliers.value ?? [])
const rootSupplierById = computed(() => {
  const map = new Map<string, Supplier & { user?: unknown }>()
  for (const supplier of suppliersCollection.value) {
    const id = String(supplier?.id || '').trim()
    if (!id) continue
    map.set(id, supplier)
  }
  return map
})

const appSupplierById = computed(() => {
  const map = new Map<string, AppSupplier>()
  for (const supplier of supplierApps.value) {
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
  modelPath: 'packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model',
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
      String((supplier as any)?.supplier_organization_name || '').trim() ||
      String((supplier as any)?.supplier_headline || '').trim() ||
      id
    const overlayStatus = appSupplierById.value.has(id) ? 'console' : 'root only'
    return {
      label: `${labelBase} · ${overlayStatus}`,
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

    const stillExists = options.some((option) => option.value === selectedSupplierId.value)
    if (!stillExists) {
      selectedSupplierId.value = String(options[0]?.value || '')
    }
  },
  { immediate: true }
)

const selectedRootSupplier = computed(() => rootSupplierById.value.get(selectedSupplierId.value) ?? null)
const selectedAppSupplier = computed(() => appSupplierById.value.get(selectedSupplierId.value) ?? null)

const supplierStorageJson = computed(() => ({
  appId: resolvedAppId.value || null,
  selectedSupplierId: selectedSupplierId.value || null,
  paths: {
    rootSupplierCollection: 'suppliers',
    overlaySupplierCollection: overlaySupplierCollectionPath.value || null,
    selectedRootSupplierDoc: selectedSupplierId.value ? `suppliers/${selectedSupplierId.value}` : null,
    selectedOverlaySupplierDoc:
      selectedSupplierId.value && overlaySupplierCollectionPath.value
        ? `${overlaySupplierCollectionPath.value}/${selectedSupplierId.value}`
        : null,
  },
  rootSupplier: selectedRootSupplier.value,
  appSupplier: selectedAppSupplier.value,
  overlayMissing: !selectedAppSupplier.value,
  childCollections: [],
}))
</script>
