import { computed, type Ref } from 'vue'
import type { SupplierSurface } from './useSupplierInterface'

export function useSupplierComputed(
  supplier?: Ref<SupplierSurface | null | undefined>
) {
  const hasSupplier = computed(() => Boolean(supplier?.value?.id))
  const hasMissingName = computed(
    () =>
      !String(
        supplier?.value?.company_place?.short_name ||
          supplier?.value?.company_place?.name ||
          ''
      ).trim()
  )
  const hasMissingSlug = computed(
    () => !String(supplier?.value?.slug || '').trim()
  )
  const isOfficial = computed(() => supplier?.value?.status === 'active')
  const isPublic = computed(() => supplier?.value?.visibility === true)
  const displayStatus = computed(() =>
    isOfficial.value ? 'Official' : isPublic.value ? 'Public' : 'Unknown'
  )
  const displayName = computed(() =>
    String(
      supplier?.value?.company_place?.short_name ||
        supplier?.value?.company_place?.name ||
        supplier?.value?.slug ||
        supplier?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(
      supplier?.value?.company_place?.logo_image ||
        supplier?.value?.company_place?.image_url ||
        ''
    ).trim()
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
