// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { chefConfig, type ChefCore } from '../../../../../../../models/profiles/Chef/Chef.model.ts'

export namespace ChefCard {
  export type Card = {
    id: string
    to: string
    avatar: string
    title: string
    subtitle: string
    badges: string[]
    line1: string
    line2: string
    line3: string
  }
}

export function useChefInterface(profile: ProfileRefs<ChefCore>) {
  function resolveProfile(target?: ChefCore | null | undefined): ChefCore | null {
    return target ?? profile.coreProfile.value ?? null
  }

  function card(target: ChefCore): ChefCard.Card
  function card(target?: ChefCore | null | undefined): ChefCard.Card | null
  function card(target?: ChefCore | null | undefined): ChefCard.Card | null {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return null

    return {
      id: currentProfile.id,
      to: `/${chefConfig.collectionName}/${currentProfile.id}`,
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
