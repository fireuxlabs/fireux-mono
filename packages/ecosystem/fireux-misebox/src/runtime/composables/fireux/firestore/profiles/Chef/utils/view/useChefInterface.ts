import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { chefConfig, type ChefCore } from '../../../../../../../models/profiles/Chef/Chef.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace ChefCard {
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
    locationsCsv: string
    organizationName: string
  }
}

export function useChefInterface(
  profile: ProfileRefs<ChefCore>,
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

  function map(p: ChefCore, u?: UserLike | null): ChefCard.Card {
    const tags = safeArray<string>((p as any)?.tags)
    const specialties = (p as any)?.specialties
    const locations = (p as any)?.locations

    const title = safeString((p as any)?.title)
    const subtitle = safeString((p as any)?.subtitle)
    const tagline = safeString((p as any)?.tagline)

    return {
      id: p.id,
      to: `/${chefConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      // Canonical: chef pills are user-hydrated; no legacy profile-name fallbacks.
      displayName: safeString(u?.display_name),

      // Prefer true tagline, else fall back to chef title/subtitle.
      // This makes pills useful even when docs are missing `tagline`.
      tagline: tagline || title || subtitle,
      badges: tags,

      bioShort: safeString((p as any)?.bio_short),
      specialtiesCsv: csv(specialties),
      locationsCsv: csv(locations),
      organizationName: safeString((p as any)?.organization_name),
    }
  }

  function card(
    target?: ChefCore | null | undefined,
    userOverride?: UserLike | null
  ): ChefCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    return map(p, u)
  }

  function searchText(target?: ChefCore | null | undefined): string {
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
