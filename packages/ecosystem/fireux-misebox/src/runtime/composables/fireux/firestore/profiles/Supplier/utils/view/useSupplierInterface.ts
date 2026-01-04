// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface.ts

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { supplierConfig, type SupplierCore } from '../../../../../../../models/profiles/Supplier/Supplier.model.ts'

export namespace SupplierCard {
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

export function useSupplierInterface(profile: ProfileRefs<SupplierCore>) {
  function resolveProfile(target?: SupplierCore | null | undefined): SupplierCore | null {
    return target ?? profile.coreProfile.value ?? null
  }

  function card(target: SupplierCore): SupplierCard.Card
  function card(target?: SupplierCore | null | undefined): SupplierCard.Card | null
  function card(target?: SupplierCore | null | undefined): SupplierCard.Card | null {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return null

    const locationLabel = currentProfile.locations
      .map((loc) => `${loc.city}, ${loc.country}`)
      .join(' · ')

    return {
      id: currentProfile.id,
      to: `/${supplierConfig.collectionName}/${currentProfile.id}`,
      avatar: currentProfile.avatar_url,
      title: currentProfile.title,
      subtitle: currentProfile.tagline,
      badges: [],
      line1: currentProfile.bio_short,
      line2: currentProfile.specialties.join(', '),
      line3: locationLabel,
    }
  }

  return { card }
}
