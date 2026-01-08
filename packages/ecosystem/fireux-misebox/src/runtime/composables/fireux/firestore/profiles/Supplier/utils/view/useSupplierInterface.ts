// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface.ts

import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { supplierConfig, type SupplierCore } from '../../../../../../../models/profiles/Supplier/Supplier.model.ts'

export namespace SupplierCard {
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

export function useSupplierInterface(
  profile: ProfileRefs<SupplierCore>,
  userRef?: Ref<User | null | undefined>
) {
  function map(currentProfile: SupplierCore, user?: User | null): SupplierCard.Card {
    const title = user?.display_name ?? currentProfile.title

    const specialties = Array.isArray(currentProfile.specialties)
      ? currentProfile.specialties
      : []

    const locationLabel = Array.isArray(currentProfile.locations)
      ? currentProfile.locations
          .filter((loc) => !!loc)
          .map((loc) => `${loc.city}, ${loc.country}`)
          .join(' · ')
      : ''

    return {
      id: currentProfile.id,
      to: `/${supplierConfig.collectionName}/${currentProfile.id}`,

      avatar: user?.avatar ?? currentProfile.avatar_url ?? '',

      title,
      subtitle: currentProfile.tagline,

      // Caller-owned, aligned with useUserInterface
      badges: [],

      line1: currentProfile.bio_short,
      line2: specialties.join(', '),
      line3: locationLabel,
    }
  }

  function card(target?: SupplierCore | null | undefined): SupplierCard.Card | null {
    const currentProfile = target ?? profile.coreProfile.value ?? null
    const user = userRef?.value ?? null
    return currentProfile ? map(currentProfile, user) : null
  }

  return { card }
}
