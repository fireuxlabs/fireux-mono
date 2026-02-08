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
    secondaryAvatarUrl?: string

    // Primary display fields
    displayName: string
    tagline: string

    // Status/label chips
    badges: string[]

    // Summary fields for list views
    summary: string
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
    const headline = safeString(p.supplier_headline) || safeString(p.title)
    const summary = safeString(p.summary)
    const profileImage = safeString(p.supplier_image)
    const userAvatar = safeString(u?.avatar)
    const secondaryAvatarUrl = profileImage && userAvatar && profileImage !== userAvatar
      ? userAvatar
      : ''
    const productCategories =
      safeStringArray(p.supplier_product_categories).length
        ? safeStringArray(p.supplier_product_categories)
        : safeStringArray(p.categories)
    const deliveryAreas =
      safeStringArray(p.supplier_delivery_areas).length
        ? safeStringArray(p.supplier_delivery_areas)
        : []
    const org = safeString(p.supplier_organization_name) || safeString(p.organization_name)

    return {
      id,
      to: id ? `/${supplierConfig.collectionName}/${id}` : '',

      avatarUrl: profileImage || userAvatar,
      secondaryAvatarUrl,

      // Canonical: supplier pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      tagline: headline,
      badges: productCategories.length ? productCategories : safeStringArray(p.tags),

      summary,
      specialtiesCsv: csv(productCategories),
      categoriesCsv: csv(productCategories),
      organizationName: org,
      locationsLabel: deliveryAreas.length
        ? deliveryAreas.join(', ')
        : locationLabel(p.locations),
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

  return { card }
}
