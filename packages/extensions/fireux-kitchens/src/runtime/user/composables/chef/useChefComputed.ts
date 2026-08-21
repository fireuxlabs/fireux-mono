import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
// Concurrent edit — 2026-07-20 17:14 CEST — Repo Efficiency Pass 2 of 6: derive Chef state from canonical fields only.
import type { Chef } from '../../models/chef.model.ts'
import { computed } from 'vue'

/**
 * useChefComputed
 * - Small, model-backed derived helpers for Chef profiles
 * - Keeps Kitchen authority out of the identity capability seam
 * - Safe to spread into useChef() return
 */
export function useChefComputed(refs: ProfileRefs<Chef>, pending?: unknown) {
  void pending

  const chefProfile = computed(() => refs.profile.value ?? null)
  const hasChefProfile = computed(() => Boolean(chefProfile.value?.id))
  const displayName = computed(() =>
    String(
      chefProfile.value?.title ||
        chefProfile.value?.chef_organization_name ||
        chefProfile.value?.id ||
        ''
    ).trim()
  )
  const hasDisplayName = computed(() => Boolean(displayName.value))
  const displayImageUrl = computed(() =>
    String(chefProfile.value?.chef_image || '').trim()
  )
  const hasBio = computed(() =>
    Boolean(
      String(
        chefProfile.value?.summary || chefProfile.value?.chef_bio || ''
      ).trim()
    )
  )

  return {
    chefProfile,
    hasChefProfile,
    displayName,
    hasDisplayName,
    displayImageUrl,
    hasBio,
  }
}
