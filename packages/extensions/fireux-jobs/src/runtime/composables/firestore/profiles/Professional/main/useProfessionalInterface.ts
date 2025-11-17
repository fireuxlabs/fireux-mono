// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/main/useProfessionalInterface.ts

import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
  type ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${professionalConfig.collectionName}/${id}` : null

/**
 * Minimal professional interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile.subtitle.
 */
export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>,
  user: Ref<User | null>
) {
  // Guardrail: keep the pill minimal—canonical user name/avatar + profile subtitle only.
  const pill = computed<ProfessionalCard.Pill | null>(() => {
    const u = user.value
    if (!u) return null

    const displayName = u.display_name?.trim() || ''
    const subtitle = profile.coreProfile.value?.subtitle?.trim() || ''

    return {
      avatar: u.avatar ?? '',
      title: displayName,
      subtitle,
      badges: [],
      to: routeFor(u.id),
    }
  })

  return { pill }
}

export const resolveProfessionalPill = (
  profile?: ProfessionalProfile | null
): ProfessionalCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name?.trim() || '',
  subtitle: profile?.subtitle?.trim() || '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveProfessionalPillKey = (pill: ProfessionalCard.Pill) =>
  pill.to ?? pill.title ?? 'professional'
