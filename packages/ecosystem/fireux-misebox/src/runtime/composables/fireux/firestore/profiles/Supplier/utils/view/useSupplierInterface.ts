import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { csv, locationLabel, safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { supplierConfig, type SupplierCore } from '../../../../../../../models/profiles/Supplier/Supplier.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    displayName: string
    tagline: string

    // Status/label chips
    badges: string[]

    // Summary fields for list views
    bioShort: string
    specialtiesCsv: string
    categoriesCsv: string
    organizationName: string
    locationsLabel: string
  }
}

export function useSupplierInterface(
  profile?: ProfileRefs<SupplierCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: SupplierCore, u?: UserLike | null): SupplierCard.Card {
    const id = safeString(p.id).trim()

    return {
      id,
      to: id ? `/${supplierConfig.collectionName}/${id}` : '',

      avatarUrl: safeString(u?.avatar),

      // Canonical: supplier pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      tagline: safeString(p.tagline),
      badges: safeStringArray(p.tags),

      bioShort: safeString(p.bio_short),
      specialtiesCsv: csv(p.specialties),
      categoriesCsv: csv(p.categories),
      organizationName: safeString(p.organization_name),
      locationsLabel: locationLabel(p.locations),
    }
  }

  function card(
    target?: SupplierCore | null | undefined,
    userOverride?: UserLike | null
  ): SupplierCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  function searchText(target?: SupplierCore | null | undefined, userOverride?: UserLike | null): string {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return ''
    const u = userOverride ?? userRef?.value ?? null
    const displayName = safeString(u?.display_name)
    const title = safeString(p.title)
    const tagline = safeString(p.tagline)
    const org = safeString(p.organization_name)
    const id = safeString(p.id)
    return `${displayName} ${title} ${tagline} ${org} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
