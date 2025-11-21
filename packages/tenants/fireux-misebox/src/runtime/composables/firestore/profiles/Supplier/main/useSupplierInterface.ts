import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  supplierConfig,
  type SupplierProfile,
  type SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${supplierConfig.collectionName}/${id}` : null

/**
 * Minimal supplier interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile tagline.
 */
export function useSupplierInterface(
  profile: ProfileRefs<SupplierProfile>,
  user: Ref<User | null>
) {
  const resolveTagline = (
    payload: { tagline?: string | null } | null | undefined
  ): string =>
    payload?.tagline ??
    (payload as { subtitle?: string | null } | null)?.subtitle ??
    ''

  // Guardrail: keep the pill minimal—canonical user name/avatar + profile tagline only.
  const pill = computed<SupplierCard.Pill | null>(() => {
    const u = user.value
    if (!u) return null

    const tagline = resolveTagline(profile.coreProfile.value).trim()

    return {
      avatar: u.avatar ?? '',
      title: u.display_name ?? '',
      subtitle: tagline,
      tagline,
      badges: [],
      to: routeFor(u.id),
    }
  })

  const cell = computed<SupplierCard.Cell | null>(() => {
    const pillValue = pill.value
    const core = profile.coreProfile.value

    if (!pillValue) return null

    return {
      ...pillValue,
      bio_short: core?.bio_short ?? null,
    }
  })

  return { pill, cell }
}

export const resolveSupplierPill = (
  profile?: SupplierProfile | null
): SupplierCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle:
    profile?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    '',
  tagline:
    profile?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveSupplierPillKey = (pill: SupplierCard.Pill) =>
  pill.to ?? pill.title ?? 'supplier'
