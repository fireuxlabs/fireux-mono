import { computed, ref, watch } from 'vue'
import {
  useSupplierCollection,
  type SupplierCollectionSource,
} from '../../composables/firestore/fetch/useSupplierCollection'
import type { Supplier } from '../../models/Supplier.model.ts'
import { SupplierDefaults as SupplierModelRuntime } from '../../models/Supplier.model.ts'

export function useSupplierSystem() {
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
  const supplierIngredientStateFilter =
    ref<SupplierIngredientStateFilter>('all')
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

    return (
      suppliers.value.find(
        (supplier) => getSupplierId(supplier) === selectedId
      ) ?? null
    )
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
    const stateFilteredRows =
      stateFilter === 'all'
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
    () =>
      suppliers.value.filter((supplier) => supplier.state === 'official').length
  )
  const publicCount = computed(
    () =>
      suppliers.value.filter((supplier) => supplier.state === 'public').length
  )
  const integratedCount = computed(
    () =>
      suppliers.value.filter(
        (supplier) => supplier.catalogue_state === 'integrated'
      ).length
  )
  const publicOnlyCount = computed(
    () =>
      suppliers.value.filter(
        (supplier) => supplier.catalogue_state === 'public_only'
      ).length
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

  const setSupplierIngredientStateFilter = (
    value: SupplierIngredientStateFilter
  ) => {
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
        selectedSupplierId.value = getSupplierId(
          nextSuppliers[0] as SupplierDevRecord
        )
      }
    },
    { immediate: true }
  )

  return {
    supplierModelRuntime,
    sourceMode,
    selectedSupplierId,
    supplierIngredientQuery,
    supplierIngredientStateFilter,
    supplierIngredientsFetched,
    supplierIngredientRows,
    suppliers,
    getSupplierId,
    getSupplierLabel,
    selectedSupplier,
    selectedSupplierLabel,
    selectedLinkedIngredientIds,
    uniqueSupplierIngredientIds,
    filteredSupplierIngredientRows,
    totalCount,
    officialCount,
    publicCount,
    integratedCount,
    publicOnlyCount,
    selectedSupplierDebug,
    supplierIngredientsDebug,
    setSourceMode,
    selectSupplier,
    setSupplierIngredientStateFilter,
    fetchSupplierIngredients,
  }
}
