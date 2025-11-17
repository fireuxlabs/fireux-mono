// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/main/useProfessionalInterface.ts

import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  type ProfessionalProfile,
  type ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>,
  user: Ref<User | null>
) {
  const pill = computed<ProfessionalCard.Pill | null>(() => {
    const currentUser = user.value
    if (!currentUser) return null

    const currentProfile =
      profile.appProfile.value ?? profile.coreProfile.value ?? null

    return resolveProfessionalPill(currentProfile, currentUser)
  })

  return { pill }
}

export function resolveProfessionalPill(
  profile?: Partial<ProfessionalProfile> | null,
  userOverride?: Partial<User> | null
): ProfessionalCard.Pill {
  const mergedUser: Partial<User> = {
    ...((profile?.user as Partial<User>) ?? {}),
    ...(userOverride ?? {}),
  }

  const avatar =
    profile?.avatar_url ?? profile?.avatar ?? mergedUser.avatar ?? ''
  const title =
    (profile?.display_name ?? '').trim() ||
    (mergedUser.display_name ?? '').trim() ||
    (profile?.title ?? '').trim() ||
    'Professional'
  const subtitle = profile?.subtitle ?? ''
  const badges = profile?.badges ?? []
  const rawId = profile?.id ?? mergedUser.id
  const id = typeof rawId === 'string' ? rawId.trim() : ''
  const to = profile?.to ?? (id ? `/professionals/${id}` : null)

  return {
    avatar,
    title,
    subtitle,
    badges,
    to,
  }
}

export const resolveProfessionalPillKey = (pill: ProfessionalCard.Pill) =>
  pill.title || 'professional'
