import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type {
  ChefProfile,
  ChefCard,
} from '../../../../../models/profiles/Chef.model.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const DEFAULT_INITIALS = 'A'
const toLink = (id?: string | null) => (id ? `/profiles/${id}` : '')

const initialsFrom = (source?: string | null) => {
  const value = (source ?? '').trim()
  return value ? value.charAt(0).toUpperCase() : DEFAULT_INITIALS
}

/**
 * Overlay-first getters (app → core) with optional target overrides.
 * Keeps parity with useAppInterface/useUserInterface.
 */
export function useChefInterface(
  profile: ProfileRefs<ChefProfile>,
  user: Ref<User | null>
) {
  const core = () => profile.coreProfile.value ?? null
  const app = () => profile.appProfile.value ?? null

  const derive = (target?: ChefProfile | null) => {
    const overlay: Partial<ChefProfile> | null = target ?? app() ?? null
    const base: Partial<ChefProfile> | null = target ? null : core()

    const pick = <T>(
      selector: (p: Partial<ChefProfile>) => T | null | undefined
    ): T | undefined => {
      return (
        (overlay && selector(overlay)) ?? (base && selector(base)) ?? undefined
      )
    }

    const id = pick((p) => p.id) ?? ''
    const fallbackTitle = user.value?.display_name ?? 'Chef'
    const title = pick((p) => p.title) ?? fallbackTitle
    const subtitle = pick((p) => p.subtitle) ?? user.value?.handle ?? 'chef'
    const avatar = pick((p) => p.avatar_url) ?? pick((p) => p.avatar) ?? ''
    const badgesCandidate = pick((p) => p.badges) ?? pick((p) => p.specialties)
    const specialtiesCandidate = pick((p) => p.specialties)
    const badges = Array.isArray(badgesCandidate) ? badgesCandidate : []
    const specialties = Array.isArray(specialtiesCandidate)
      ? specialtiesCandidate
      : []
    const bioShort = pick((p) => p.bio_short) ?? ''
    const bioLong = pick((p) => p.bio_long) ?? ''

    return {
      id,
      title,
      subtitle,
      avatar,
      badges,
      specialties,
      bioShort,
      bioLong,
    }
  }

  const pillProps = (target?: ChefProfile | null): ChefCard.Pill => {
    const derived = derive(target)
    return {
      avatar: derived.avatar,
      initials: initialsFrom(derived.title),
      title: derived.title,
      subtitle: derived.subtitle,
      badges: derived.badges,
      to: derived.id ? toLink(derived.id) : null,
    }
  }

  const cellProps = (target?: ChefProfile | null): ChefCard.Cell => {
    const derived = derive(target)
    return {
      ...pillProps(target),
      id: derived.id,
      to: derived.id ? toLink(derived.id) : undefined,
      bio_short: derived.bioShort,
      specialties: Array.isArray(derived.specialties)
        ? derived.specialties
        : [],
    }
  }

  const profileProps = (target?: ChefProfile | null): ChefCard.Profile => {
    const derived = derive(target)
    return {
      ...cellProps(target),
      bio_long: derived.bioLong,
    }
  }

  return { pillProps, cellProps, profileProps }
}
