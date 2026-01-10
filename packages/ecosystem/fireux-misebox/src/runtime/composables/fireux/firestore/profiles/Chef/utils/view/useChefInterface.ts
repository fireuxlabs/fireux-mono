// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts

import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { chefConfig, type ChefCore } from '../../../../../../../models/profiles/Chef/Chef.model.ts'

export namespace ChefCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatar: string

    title: string
    subtitle: string
    badges: string[]

    line1: string
    line2: string
    line3: string
  }
}

export function useChefInterface(
  profile: ProfileRefs<ChefCore>,
  userRef?: Ref<User | null | undefined>
) {
  function resolveBadges(currentProfile: ChefCore): string[] {
    const tags = (currentProfile as any)?.tags
    if (Array.isArray(tags)) return tags.filter((x) => typeof x === 'string') as string[]
    const legacy = (currentProfile as any)?.badges
    if (Array.isArray(legacy)) return legacy.filter((x) => typeof x === 'string') as string[]
    return []
  }

  function map(currentProfile: ChefCore, user?: User | null): ChefCard.Card {
    const title = user?.display_name ?? currentProfile.title
    const specialties = Array.isArray(currentProfile.specialties)
      ? currentProfile.specialties
      : []
    const locations = Array.isArray(currentProfile.locations)
      ? currentProfile.locations
      : []

    return {
      id: currentProfile.id,
      to: `/${chefConfig.collectionName}/${currentProfile.id}`,

      avatar: user?.avatar ?? currentProfile.avatar_url ?? '',

      title,
      subtitle: currentProfile.tagline,

      badges: resolveBadges(currentProfile),

      line1: currentProfile.bio_short,
      line2: specialties.join(', '),
      line3: locations.join(', '),
    }
  }

  function card(target?: ChefCore | null | undefined): ChefCard.Card | null {
    const currentProfile = target ?? profile.coreProfile.value ?? null
    const user = userRef?.value ?? null
    return currentProfile ? map(currentProfile, user) : null
  }

  return { card }
}
