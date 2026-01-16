import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
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
  profile: ProfileRefs<SupplierCore>,
  userRef?: Ref<User | null | undefined>
) {
  function safeArray<T>(input: unknown): T[] {
    return Array.isArray(input) ? (input as T[]) : []
  }

  function safeString(input: unknown): string {
    return typeof input === 'string' ? input : ''
  }

  function csv(list: unknown): string {
    return safeArray<string>(list).join(', ')
  }

  function locationLabel(list: unknown): string {
    const parsed = safeArray<unknown>(list)
      .map((x: any) => {
        const city = safeString(x?.city)
        const country = safeString(x?.country)
        if (!city && !country) return ''
        return [city, country].filter(Boolean).join(', ')
      })
      .filter(Boolean)

    return parsed.join(' · ')
  }

  function map(p: SupplierCore, u?: UserLike | null): SupplierCard.Card {
    const tags = safeArray<string>((p as any)?.tags)
    const specialties = (p as any)?.specialties
    const categories = (p as any)?.categories
    const locations = (p as any)?.locations

    return {
      id: p.id,
      to: `/${supplierConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      // Canonical: supplier pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      tagline: safeString((p as any)?.tagline),
      badges: tags,

      bioShort: safeString((p as any)?.bio_short),
      specialtiesCsv: csv(specialties),
      categoriesCsv: csv(categories),
      organizationName: safeString((p as any)?.organization_name),
      locationsLabel: locationLabel(locations),
    }
  }

  function card(
    target?: SupplierCore | null | undefined,
    userOverride?: UserLike | null
  ): SupplierCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    return map(p, u)
  }

  function searchText(target?: SupplierCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const displayName = safeString((u as any)?.display_name)
    const title = safeString((p as any)?.title)
    const tagline = safeString((p as any)?.tagline)
    const org = safeString((p as any)?.organization_name)
    return `${displayName} ${title} ${tagline} ${org} ${p.id}`.toLowerCase()
  }

  return { card, searchText }
}
