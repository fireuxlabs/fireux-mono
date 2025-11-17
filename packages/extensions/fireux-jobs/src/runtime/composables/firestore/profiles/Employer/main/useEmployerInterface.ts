import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  employerConfig,
  type EmployerProfile,
  type EmployerCard,
} from '../../../../../models/profiles/Employer.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${employerConfig.collectionName}/${id}` : null

/**
 * Minimal employer interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile.subtitle.
 */
export function useEmployerInterface(
  profile: ProfileRefs<EmployerProfile>,
  user: Ref<User | null>
) {
  // Guardrail: keep the pill minimal—canonical user name/avatar + profile subtitle only.
  const pill = computed<EmployerCard.Pill | null>(() => {
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

  return { pill }
}

export const resolveEmployerPill = (
  profile?: EmployerProfile | null
): EmployerCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle: profile?.subtitle ?? '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveEmployerPillKey = (pill: EmployerCard.Pill) =>
  pill.to ?? pill.title ?? 'employer'
