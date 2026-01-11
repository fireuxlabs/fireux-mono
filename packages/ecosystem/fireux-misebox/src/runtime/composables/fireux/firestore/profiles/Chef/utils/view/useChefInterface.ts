
import type { Ref } from 'vue'
import type { User } from '../../packages/core/fireux-core/src/runtime/models/core/user.model'
import type { ProfileRefs } from '../../packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { ChefCore } from '../../packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model'
import { chefConfig } from '../../packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/supporting'

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
  function csv(list: string[]): string {
    return list.join(', ')
  }

  function map(p: ChefCore, u?: User | null): ChefCard.Card {
    return {
      id: p.id,
      to: `/${chefConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      displayName: u?.display_name ?? p.title,
      tagline: p.tagline,
      badges: p.tags,

      bioShort: p.bio_short,
      specialtiesCsv: csv(p.specialties),
      locationsCsv: csv(p.locations),
      organizationName: p.organization_name,
    }
  }

  function card(target?: ChefCore | null | undefined): ChefCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    return map(p, userRef?.value ?? null)
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
