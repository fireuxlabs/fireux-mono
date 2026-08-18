import { computed, type Ref } from 'vue'
import type { Supplier } from '../../../../models/Supplier.model.ts'

export function useSupplierComputed(
  supplier?: Ref<Partial<Supplier> | null | undefined>
) {
  const hasSupplier = computed(() => Boolean(supplier?.value?.id))
  const hasMissingName = computed(() =>
    !String(supplier?.value?.supplier_organization_name || '').trim()
  )
  const hasMissingSlug = computed(() =>
    !String(supplier?.value?.slug || '').trim()
  )
  const isOfficial = computed(() => supplier?.value?.state === 'official')
  const isPublic = computed(() => supplier?.value?.state === 'public')
  const displayStatus = computed(() =>
    isOfficial.value ? 'Official' : isPublic.value ? 'Public' : 'Unknown'
  )
  const displayName = computed(() =>
    String(
      supplier?.value?.supplier_organization_name ||
        supplier?.value?.slug ||
        supplier?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(supplier?.value?.supplier_image || '').trim()
  )
  const hasCatalogue = computed(() =>
    Boolean(String(supplier?.value?.catalogue_state || '').trim())
  )

  return {
    hasSupplier,
    hasMissingName,
    hasMissingSlug,
    isOfficial,
    isPublic,
    displayStatus,
    displayName,
    displayImageUrl,
    hasCatalogue,
  }
}
