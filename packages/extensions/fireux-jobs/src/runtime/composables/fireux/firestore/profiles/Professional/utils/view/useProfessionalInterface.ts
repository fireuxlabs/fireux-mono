import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace ProfessionalCard {
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
  }
}

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalCore>,
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

  function map(p: ProfessionalCore, u?: UserLike | null): ProfessionalCard.Card {
    const title = safeString((p as any)?.title)
    const subtitle = safeString((p as any)?.subtitle)
    const tagline = safeString((p as any)?.tagline)
    const tags = safeArray<string>((p as any)?.tags)
    const specialties = (p as any)?.specialties
    const locations = (p as any)?.locations

    return {
      id: p.id,
      to: `/${professionalConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      // Canonical: professional pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      tagline: tagline || title || subtitle,
      badges: tags,

      bioShort: safeString((p as any)?.bio_short),
      specialtiesCsv: csv(specialties),
      locationsCsv: csv(locations),
    }
  }

  function card(
    target?: ProfessionalCore | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    return map(p, u)
  }

  function searchText(target?: ProfessionalCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const displayName = safeString((u as any)?.display_name)
    const title = safeString((p as any)?.title)
    const tagline = safeString((p as any)?.tagline)
    return `${displayName} ${title} ${tagline} ${p.id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
