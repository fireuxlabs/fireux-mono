import { computed } from 'vue'
import { useSupplierConsole } from './useSupplierConsole'
import { getDemoSupplierCatalogueItems } from '../utils/supplier-demo-scenarios'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleCatalogue() {
  const { selectedSupplier, selectedMode } = useSupplierConsole()

  const supplierId = computed(() =>
    normalizeString(selectedSupplier.value?.id)
  )

  const supplierLabel = computed(() =>
    normalizeString(selectedSupplier.value?.supplier_organization_name)
  )

  const linkedIngredientIds = computed(() =>
    Array.isArray(selectedSupplier.value?.linked_ingredient_ids)
      ? selectedSupplier.value.linked_ingredient_ids
          .map((value) => normalizeString(value))
          .filter(Boolean)
      : []
  )

  const state = computed(() => normalizeString(selectedSupplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(selectedSupplier.value?.catalogue_state)
  )

  const catalogueItems = computed(() =>
    selectedMode.value === 'demo' && supplierId.value
      ? getDemoSupplierCatalogueItems(supplierId.value)
      : []
  )
  const pending = computed(() => false)
  const canWrite = computed(() => selectedMode.value === 'live')

  const isIntegratedCatalogue = computed(
    () => catalogueState.value === 'integrated'
  )
  const isPublicOnlySupplier = computed(
    () => catalogueState.value === 'public_only'
  )

  const emptyTitle = computed(() => {
    if (isPublicOnlySupplier.value) return 'Public supplier only'
    if (selectedMode.value === 'live') return 'No live catalogue items yet'
    if (selectedMode.value === 'test') return 'No test catalogue items yet'
    return 'No catalogue items available'
  })

  const emptyDescription = computed(() => {
    if (isPublicOnlySupplier.value) {
      return 'This supplier is linked as a useful public record, but it does not own an integrated supplier catalogue yet.'
    }

    if (selectedMode.value === 'live') {
      return 'This supplier console page is ready, but live supplier-owned catalogue rows are not wired here yet.'
    }

    if (selectedMode.value === 'test') {
      return 'This test supplier does not have any catalogue rows yet.'
    }

    return 'No catalogue items are available for the selected supplier.'
  })

  const modeLabel = computed(() => {
    if (selectedMode.value === 'demo') return 'Demo'
    if (selectedMode.value === 'test') return 'Test'
    return 'Live'
  })

  const catalogueTitle = computed(() =>
    supplierLabel.value ? `${supplierLabel.value} Catalogue` : 'Supplier Catalogue'
  )

  const catalogueDescription = computed(() => {
    const parts = [
      modeLabel.value,
      `state: ${state.value || 'missing'}`,
      `catalogue: ${catalogueState.value || 'missing'}`,
      `${linkedIngredientIds.value.length} linked ingredients`,
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(
    () => `console supplier · catalogue · ${selectedMode.value}`
  )

  const formatPrice = (valueMinor: number, currencyCode?: string) =>
    new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: normalizeString(currencyCode).toUpperCase() || 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(valueMinor || 0) / 100)

  return {
    selectedSupplier,
    selectedMode,
    supplierId,
    supplierLabel,
    linkedIngredientIds,
    state,
    catalogueState,
    catalogueItems,
    pending,
    canWrite,
    isIntegratedCatalogue,
    isPublicOnlySupplier,
    emptyTitle,
    emptyDescription,
    modeLabel,
    catalogueTitle,
    catalogueDescription,
    devJsonContext,
    formatPrice,
  }
}

export type SupplierConsoleCatalogueState = ReturnType<
  typeof useSupplierConsoleCatalogue
>
