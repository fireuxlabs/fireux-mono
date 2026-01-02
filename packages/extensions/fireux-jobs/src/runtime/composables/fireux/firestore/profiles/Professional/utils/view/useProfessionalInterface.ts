// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model.ts'
import type { ProfessionalCard } from '../../../../../../../types/profiles/ProfessionalCard.ts'

export function useProfessionalInterface(profile: ProfileRefs<ProfessionalCore>) {
  const resolveProfile = (target?: ProfessionalCore): ProfessionalCore => {
    const current = target ?? profile.coreProfile.value
    if (!current) {
      throw new Error('[useProfessionalInterface] Professional profile is required')
    }
    return current
  }

  const card = (target?: ProfessionalCore): ProfessionalCard.Card => {
    const currentProfile = resolveProfile(target)

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
