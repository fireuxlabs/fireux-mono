import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  supplierConfig,
  resolveSupplierCell,
  type SupplierProfile,
  type SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${supplierConfig.collectionName}/${id}` : null

/**
 * Minimal supplier interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile.subtitle.
 */
export function useSupplierInterface(
  profile: ProfileRefs<SupplierProfile>,
  user: Ref<User | null>
) {
  // Guardrail: keep the pill minimal—canonical user name/avatar + profile subtitle only.
  const pill = computed<SupplierCard.Pill | null>(() => {
    const u = user.value
    if (!u) return null

    return {
      avatar: u.avatar ?? '',
      title: u.display_name ?? '',
      subtitle: profile.coreProfile.value?.subtitle ?? '',
      badges: [],
      to: routeFor(u.id),
    }
  })

  const cell = computed<SupplierCard.Cell | null>(() =>
    resolveSupplierCell(profile.coreProfile.value)
  )

  return { pill, cell }
}

export const resolveSupplierPill = (
  profile?: SupplierProfile | null
): SupplierCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle: profile?.subtitle ?? '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveSupplierPillKey = (pill: SupplierCard.Pill) =>
  pill.to ?? pill.title ?? 'supplier'
