// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model.ts'
import type { ProfessionalCard } from '../../../../../../../types/profiles/ProfessionalCard.ts'

export function useProfessionalInterface(profile: ProfileRefs<ProfessionalCore>) {
  function resolveProfile(target?: ProfessionalCore | null | undefined): ProfessionalCore | null {
    return target ?? profile.coreProfile.value ?? null
  }

  function card(target: ProfessionalCore): ProfessionalCard.Card
  function card(target?: ProfessionalCore | null | undefined): ProfessionalCard.Card | null
  function card(target?: ProfessionalCore | null | undefined): ProfessionalCard.Card | null {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return null

    return {
      id: currentProfile.id,
      to: `/${professionalConfig.collectionName}/${currentProfile.id}`,
      avatar: currentProfile.avatar_url,
      title: currentProfile.title,
      subtitle: currentProfile.tagline,
      badges: [],
      line1: currentProfile.bio_short,
      line2: currentProfile.specialties.join(', '),
      line3: currentProfile.locations.join(', '),
    }
  }

  return { card }
}
