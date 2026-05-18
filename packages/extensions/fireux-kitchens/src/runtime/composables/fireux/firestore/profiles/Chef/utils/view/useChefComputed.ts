import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { Chef } from '../../../../../../../models/profiles/Chef/Chef.model'
import { computed } from 'vue'

/**
 * useChefComputed
 * - Small, model-backed derived helpers for Chef profiles
 * - Keeps Kitchen authority out of the identity capability seam
 * - Safe to spread into useChef() return
 */
export function useChefComputed(
  refs: ProfileRefs<Chef>,
  pending?: unknown
) {
  void pending

  const chefProfile = computed(() => refs.coreProfile.value ?? null)
  const hasChefProfile = computed(() => Boolean(chefProfile.value?.id))
  const displayName = computed(() =>
    String(
      chefProfile.value?.title ||
        chefProfile.value?.chef_organization_name ||
        chefProfile.value?.organization_name ||
        chefProfile.value?.id ||
        ''
    ).trim()
  )
  const hasDisplayName = computed(() => Boolean(displayName.value))
  const displayImageUrl = computed(() =>
    String(chefProfile.value?.chef_image || '').trim()
  )
  const hasAppOverlay = computed(() => Boolean(refs.appProfile.value?.id))
  const hasKitchenLinks = computed(() =>
    Boolean(chefProfile.value?.kitchen_ids?.length)
  )
  const hasBio = computed(() =>
    Boolean(
      String(
        chefProfile.value?.summary ||
          chefProfile.value?.chef_bio ||
          chefProfile.value?.bio_long ||
          ''
      ).trim()
    )
  )

  return {
    chefProfile,
    hasChefProfile,
    displayName,
    hasDisplayName,
    displayImageUrl,
    hasAppOverlay,
    hasKitchenLinks,
    hasBio,
  }
}
