import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { chefConfig, type ChefCore } from '../../../../../../../models/profiles/Chef/Chef.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace ChefCard {
  export type Card = {
    id: string
    to: string

    avatarUrl: string

    displayName: string
    tagline: string
    badges: string[]

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

    return {
      id: p.id,
      to: `/${chefConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      displayName: u?.display_name ?? safeString((p as any)?.title),
      tagline: safeString((p as any)?.tagline),
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
    const name = u?.display_name ?? p.title
    return `${name} ${p.tagline} ${p.organization_name} ${p.id}`.toLowerCase()
  }

  return { card, searchText }
}
