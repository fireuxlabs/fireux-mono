import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model'

export namespace ProfessionalCard {
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
  }
}

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalCore>,
  userRef?: Ref<User | null | undefined>
) {
  function csv(list: string[]): string {
    return list.join(', ')
  }

  function map(p: ProfessionalCore, u?: User | null): ProfessionalCard.Card {
    return {
      id: p.id,
      to: `/${professionalConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      displayName: u?.display_name ?? p.title,
      tagline: p.tagline,
      badges: p.tags,

      bioShort: p.bio_short,
      specialtiesCsv: csv(p.specialties),
      locationsCsv: csv(p.locations),
    }
  }

  function card(target?: ProfessionalCore | null | undefined): ProfessionalCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    return map(p, userRef?.value ?? null)
  }

  function searchText(target?: ProfessionalCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const name = u?.display_name ?? p.title
    return `${name} ${p.tagline} ${p.id}`.toLowerCase()
  }

  return { card, searchText }
}
