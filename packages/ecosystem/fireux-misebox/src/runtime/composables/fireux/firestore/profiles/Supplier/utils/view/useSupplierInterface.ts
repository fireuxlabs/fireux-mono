import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { supplierConfig, type SupplierCore } from '../../../../../../../models/profiles/Supplier/Supplier.model'

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string

    avatarUrl: string

    displayName: string
    tagline: string
    badges: string[]

    bioShort: string
    specialtiesCsv: string
    categoriesCsv: string
    organizationName: string
    locationsLabel: string
  }
}

export function useSupplierInterface(
  profile: ProfileRefs<SupplierCore>,
  userRef?: Ref<User | null | undefined>
) {
  function csv(list: string[]): string {
    return list.join(', ')
  }

  function locationLabel(list: Array<{ city: string; country: string }>): string {
    return list.map((x) => `${x.city}, ${x.country}`).join(' · ')
  }

  function map(p: SupplierCore, u?: User | null): SupplierCard.Card {
    return {
      id: p.id,
      to: `/${supplierConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      displayName: u?.display_name ?? p.title,
      tagline: p.tagline,
      badges: p.tags,

      bioShort: p.bio_short,
      specialtiesCsv: csv(p.specialties),
      categoriesCsv: csv(p.categories),
      organizationName: p.organization_name,
      locationsLabel: locationLabel(p.locations),
    }
  }

  function card(target?: SupplierCore | null | undefined): SupplierCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    return map(p, userRef?.value ?? null)
  }

  function searchText(target?: SupplierCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const name = u?.display_name ?? p.title
    return `${name} ${p.tagline} ${p.organization_name} ${p.id}`.toLowerCase()
  }

  return { card, searchText }
}
