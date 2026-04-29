import { computed } from 'vue'
import { useSupplierConsole } from './useSupplierConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleCatalogue() {
  const {
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
  } = useSupplierConsole()

  const supplierLabel = computed(() =>
    normalizeString(selectedSupplier.value?.supplier_organization_name)
  )

  const state = computed(() => normalizeString(selectedSupplier.value?.state))
  const catalogueState = computed(() =>
    normalizeString(selectedSupplier.value?.catalogue_state)
  )
  const supplierCataloguesCollectionPath = computed(() =>
    rootCollection.value && supplierId.value
      ? `${rootCollection.value}/${supplierId.value}/catalogues`
      : ''
  )
  const catalogues = computed(() => [])
  const pending = computed(() => false)

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
      return 'No supplier catalogue grouping rows are available for this supplier yet.'
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
    ]

    return parts.join(' · ')
  })

  const devJsonContext = computed(
    () => `console supplier · catalogue · ${selectedMode.value}`
  )
  const debug = computed(() => ({
    mode: selectedMode.value,
    supplierId: supplierId.value,
    supplierName: supplierLabel.value,
    rootCollection: rootCollection.value,
    state: state.value,
    catalogueState: catalogueState.value,
    supplierCataloguesCollectionPath: supplierCataloguesCollectionPath.value,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedSupplier,
    selectedMode,
    supplierId,
    supplierLabel,
    rootCollection,
    state,
    catalogueState,
    supplierCataloguesCollectionPath,
    catalogues,
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
    debug,
  }
}

export type SupplierConsoleCatalogueState = ReturnType<
  typeof useSupplierConsoleCatalogue
>
