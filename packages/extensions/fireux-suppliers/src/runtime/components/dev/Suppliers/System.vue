<template>
  <section class="space-y-4">
    <UCard>
      <template #header>
        <div class="space-y-3">
          <div class="text-sm font-semibold">Supplier model</div>
          <div class="flex flex-wrap gap-2">
            <UBadge variant="soft">Total: {{ totalCount }}</UBadge>
            <UBadge variant="soft">Official: {{ officialCount }}</UBadge>
            <UBadge variant="soft">Public: {{ publicCount }}</UBadge>
            <UBadge variant="soft">Integrated: {{ integratedCount }}</UBadge>
            <UBadge variant="soft">Public only: {{ publicOnlyCount }}</UBadge>
          </div>
        </div>
      </template>

      <DevModel
        :title="'Suppliers · Model'"
        :model="supplierModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Suppliers</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Developer-selected supplier source. This is a scoped dev list, not the public supplier collection manager.
          </p>
        </div>
      </template>

      <div
        v-if="suppliers.length"
        class="grid gap-2 md:grid-cols-2 xl:grid-cols-3"
      >
        <button
          v-for="supplier in suppliers"
          :key="getSupplierId(supplier)"
          type="button"
          class="rounded-lg border border-default bg-elevated/30 p-3 text-left text-sm transition hover:bg-elevated"
          :class="{
            'ring-2 ring-primary': getSupplierId(supplier) === selectedSupplierId,
          }"
          @click="selectSupplier(getSupplierId(supplier))"
        >
          <div class="font-semibold text-highlighted">
            {{ getSupplierLabel(supplier) }}
          </div>
          <div class="mt-1 font-mono text-xs text-dimmed">
            {{ getSupplierId(supplier) }}
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <UBadge variant="soft" color="neutral">
              {{ supplier.state || 'missing state' }}
            </UBadge>
            <UBadge variant="soft" color="neutral">
              {{ supplier.catalogue_state || 'missing catalogue' }}
            </UBadge>
          </div>
        </button>
      </div>

      <p v-else class="text-sm text-dimmed">
        No suppliers found for this source.
      </p>

      <DevJson
        title="Suppliers (JSON)"
        context="dev suppliers · selected source"
        :data="suppliers"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-3">
          <div class="space-y-1">
            <div class="text-sm font-semibold">Supplier ingredients</div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Search every supplier ingredient link in the selected source.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UFieldGroup size="xs">
              <UButton
                :variant="sourceMode === 'live' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('live')"
              >
                Live
              </UButton>
              <UButton
                :variant="sourceMode === 'demo' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('demo')"
              >
                Demo
              </UButton>
              <UButton
                :variant="sourceMode === 'test' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('test')"
              >
                Test
              </UButton>
            </UFieldGroup>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-database-zap"
              @click="fetchSupplierIngredients"
            >
              {{ supplierIngredientsFetched ? 'Refresh supplier ingredients' : 'Fetch supplier ingredients' }}
            </UButton>
            <UFieldGroup size="xs">
              <UButton
                :variant="supplierIngredientStateFilter === 'all' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSupplierIngredientStateFilter('all')"
              >
                All
              </UButton>
              <UButton
                :variant="supplierIngredientStateFilter === 'official' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSupplierIngredientStateFilter('official')"
              >
                Official
              </UButton>
              <UButton
                :variant="supplierIngredientStateFilter === 'public' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSupplierIngredientStateFilter('public')"
              >
                Public
              </UButton>
            </UFieldGroup>
            <UInput
              v-model="supplierIngredientQuery"
              size="xs"
              placeholder="Search ingredient or supplier…"
              :disabled="!supplierIngredientsFetched"
            />
            <template v-if="supplierIngredientsFetched">
              <UBadge variant="soft">
                Links: {{ supplierIngredientRows.length }}
              </UBadge>
              <UBadge variant="soft">
                Unique ingredients: {{ uniqueSupplierIngredientIds.length }}
              </UBadge>
              <UBadge variant="soft">
                Showing: {{ filteredSupplierIngredientRows.length }}
              </UBadge>
            </template>
            <UBadge v-else variant="soft">
              Not fetched
            </UBadge>
          </div>
        </div>
      </template>

      <div
        v-if="supplierIngredientsFetched && filteredSupplierIngredientRows.length"
        class="grid gap-2 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="row in filteredSupplierIngredientRows"
          :key="row.key"
          class="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
        >
          <div class="font-mono text-xs text-gray-500 dark:text-gray-400">
            {{ row.ingredientId }}
          </div>
          <div class="mt-1 font-medium">
            {{ row.supplierLabel }}
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <UBadge variant="soft" color="neutral">
              {{ row.state || 'missing state' }}
            </UBadge>
            <UBadge variant="soft" color="neutral">
              {{ row.catalogueState || 'missing catalogue' }}
            </UBadge>
          </div>
        </div>
      </div>

      <p v-else-if="supplierIngredientsFetched" class="text-sm text-dimmed">
        No supplier ingredient links match this search.
      </p>

      <p v-else class="text-sm text-dimmed">
        Click fetch to build a supplier ingredient snapshot for the current source.
      </p>

      <DevJson
        title="All supplier ingredients (JSON)"
        context="dev suppliers · all linked ingredient ids"
        :data="supplierIngredientsDebug"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <div class="text-sm font-semibold">Linked ingredients</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Supplier-side ingredient links stay visible here without expanding the public collection manager.
          </p>
        </div>
      </template>

      <div v-if="selectedSupplier" class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge variant="soft">
            Supplier: {{ selectedSupplierLabel }}
          </UBadge>
          <UBadge variant="soft">
            State: {{ selectedSupplier.state || 'missing' }}
          </UBadge>
          <UBadge variant="soft">
            Catalogue: {{ selectedSupplier.catalogue_state || 'missing' }}
          </UBadge>
          <UBadge variant="soft">
            Linked ingredients: {{ selectedLinkedIngredientIds.length }}
          </UBadge>
        </div>

        <div
          v-if="selectedLinkedIngredientIds.length"
          class="flex flex-wrap gap-2"
        >
          <UBadge
            v-for="ingredientId in selectedLinkedIngredientIds"
            :key="ingredientId"
            variant="soft"
            color="neutral"
          >
            {{ ingredientId }}
          </UBadge>
        </div>

        <p v-else class="text-sm text-dimmed">
          This supplier does not list linked ingredient ids yet.
        </p>
      </div>

      <p v-else class="text-sm text-dimmed">
        Select a supplier above to inspect its linked ingredients.
      </p>

      <DevJson
        title="Supplier linked ingredients (JSON)"
        context="dev suppliers · selected supplier links"
        :data="selectedSupplierDebug"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  useSupplierCollection,
  type SupplierCollectionSource,
} from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { SupplierModel as SupplierModelRuntime } from '../../../models/supplier/Supplier.model'

defineOptions({ name: 'DevSuppliersSystem' })

type SupplierDevRecord = Partial<Supplier> & {
  id?: string
  supplier_id?: string
  name?: string
}
type SupplierIngredientRow = {
  key: string
  supplierId: string
  supplierLabel: string
  ingredientId: string
  state: string
  catalogueState: string
}
type SupplierIngredientStateFilter = 'all' | 'official' | 'public'

const supplierModelRuntime = SupplierModelRuntime
const sourceMode = ref<SupplierCollectionSource>('demo')
const selectedSupplierId = ref('')
const supplierIngredientQuery = ref('')
const supplierIngredientStateFilter = ref<SupplierIngredientStateFilter>('all')
const supplierIngredientsFetched = ref(false)
const supplierIngredientRows = ref<SupplierIngredientRow[]>([])

const { suppliers } = useSupplierCollection({ source: sourceMode })

const normalizeString = (value: unknown) => String(value ?? '').trim()
const getSupplierId = (supplier: SupplierDevRecord) =>
  normalizeString(supplier.id || supplier.supplier_id)
const getSupplierLabel = (supplier: SupplierDevRecord) =>
  normalizeString(
    supplier.supplier_organization_name ||
      supplier.name ||
      supplier.id ||
      supplier.supplier_id
  )

const selectedSupplier = computed<SupplierDevRecord | null>(() => {
  const selectedId = normalizeString(selectedSupplierId.value)
  if (!selectedId) return null

  return suppliers.value.find((supplier) => getSupplierId(supplier) === selectedId) ?? null
})

const selectedSupplierLabel = computed(() =>
  normalizeString(
    selectedSupplier.value?.supplier_organization_name ||
      selectedSupplier.value?.name ||
      selectedSupplier.value?.id
  )
)

const selectedLinkedIngredientIds = computed(() =>
  Array.isArray(selectedSupplier.value?.linked_ingredient_ids)
    ? selectedSupplier.value.linked_ingredient_ids
        .map((value) => normalizeString(value))
        .filter(Boolean)
    : []
)

const buildSupplierIngredientRows = () =>
  suppliers.value.flatMap<SupplierIngredientRow>((supplier) => {
    const supplierId = getSupplierId(supplier)
    const supplierLabel = getSupplierLabel(supplier) || supplierId
    const ingredientIds = Array.isArray(supplier.linked_ingredient_ids)
      ? supplier.linked_ingredient_ids
          .map((value) => normalizeString(value))
          .filter(Boolean)
      : []

    return ingredientIds.map((ingredientId) => ({
      key: `${supplierId}:${ingredientId}`,
      supplierId,
      supplierLabel,
      ingredientId,
      state: normalizeString(supplier.state),
      catalogueState: normalizeString(supplier.catalogue_state),
    }))
  })
const uniqueSupplierIngredientIds = computed(() =>
  Array.from(
    new Set<string>(
      supplierIngredientRows.value.map(
        (row: SupplierIngredientRow) => row.ingredientId
      )
    )
  ).sort((a: string, b: string) => a.localeCompare(b))
)
const supplierIngredientSearchTerm = computed(() =>
  normalizeString(supplierIngredientQuery.value).toLowerCase()
)
const filteredSupplierIngredientRows = computed(() => {
  const searchTerm = supplierIngredientSearchTerm.value
  const stateFilter = supplierIngredientStateFilter.value
  const stateFilteredRows = stateFilter === 'all'
    ? supplierIngredientRows.value
    : supplierIngredientRows.value.filter(
        (row: SupplierIngredientRow) => row.state === stateFilter
      )

  if (!searchTerm) return stateFilteredRows

  return stateFilteredRows.filter((row: SupplierIngredientRow) =>
    [
      row.ingredientId,
      row.supplierId,
      row.supplierLabel,
      row.state,
      row.catalogueState,
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm)
  )
})

const totalCount = computed(() => suppliers.value.length)
const officialCount = computed(
  () => suppliers.value.filter((supplier) => supplier.state === 'official').length
)
const publicCount = computed(
  () => suppliers.value.filter((supplier) => supplier.state === 'public').length
)
const integratedCount = computed(
  () => suppliers.value.filter((supplier) => supplier.catalogue_state === 'integrated').length
)
const publicOnlyCount = computed(
  () => suppliers.value.filter((supplier) => supplier.catalogue_state === 'public_only').length
)

const selectedSupplierDebug = computed(() => ({
  source: sourceMode.value,
  supplierId: selectedSupplierId.value || null,
  supplier: selectedSupplier.value,
  linked_ingredient_ids: selectedLinkedIngredientIds.value,
}))
const supplierIngredientsDebug = computed(() => ({
  source: sourceMode.value,
  fetched: supplierIngredientsFetched.value,
  stateFilter: supplierIngredientStateFilter.value,
  query: supplierIngredientQuery.value || null,
  linkCount: supplierIngredientRows.value.length,
  visibleCount: filteredSupplierIngredientRows.value.length,
  unique_ingredient_ids: uniqueSupplierIngredientIds.value,
  rows: filteredSupplierIngredientRows.value,
}))

const setSourceMode = (value: SupplierCollectionSource) => {
  if (sourceMode.value !== value) {
    supplierIngredientsFetched.value = false
    supplierIngredientRows.value = []
    supplierIngredientQuery.value = ''
  }
  sourceMode.value = value
}

const selectSupplier = (supplierId: string) => {
  selectedSupplierId.value = normalizeString(supplierId)
}

const setSupplierIngredientStateFilter = (value: SupplierIngredientStateFilter) => {
  supplierIngredientStateFilter.value = value
}

const fetchSupplierIngredients = () => {
  supplierIngredientRows.value = buildSupplierIngredientRows()
  supplierIngredientsFetched.value = true
}

watch(
  suppliers,
  (nextSuppliers: SupplierDevRecord[]) => {
    if (!nextSuppliers.length) {
      selectedSupplierId.value = ''
      return
    }

    const selectedStillExists = nextSuppliers.some(
      (supplier: SupplierDevRecord) =>
        getSupplierId(supplier) === selectedSupplierId.value
    )
    if (!selectedStillExists) {
      selectedSupplierId.value = getSupplierId(nextSuppliers[0] as SupplierDevRecord)
    }
  },
  { immediate: true }
)
</script>
