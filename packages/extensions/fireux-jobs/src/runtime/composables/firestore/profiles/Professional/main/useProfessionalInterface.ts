import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'

const DEFAULT_INITIALS = 'A'
const toLink = (id?: string | null) => (id ? `/profiles/${id}` : '')

const initialsFrom = (source?: string | null) => {
  const value = (source ?? '').trim()
  return value ? value.charAt(0).toUpperCase() : DEFAULT_INITIALS
}

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>
) {
  const core = () => profile.coreProfile.value ?? null
  const appOverlay = () => profile.appProfile.value ?? null

  const derive = (target?: ProfessionalProfile | null) => {
    const overlay: Partial<ProfessionalProfile> | null =
      target ?? appOverlay() ?? null
    const base: Partial<ProfessionalProfile> | null = target ? null : core()

    const pick = <T>(
      selector: (p: Partial<ProfessionalProfile>) => T | null | undefined
    ): T | undefined =>
      (overlay && selector(overlay)) ?? (base && selector(base)) ?? undefined

    const id = pick((p) => p.id) ?? ''
    const title =
      pick((p) => p.title) ?? pick((p) => p.display_name) ?? 'Professional'
    const subtitle = pick((p) => p.subtitle) ?? 'professional'
    const avatar = pick((p) => p.avatar_url) ?? pick((p) => p.avatar) ?? ''
    const badgesCandidate =
      pick((p) => p.health_certifications) ??
      pick((p) => p.badges) ??
      pick((p) => p.specialties)
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

  const pillProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Pill => {
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

  const cellProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Cell => {
    const derived = derive(target)
    return {
      ...pillProps(target),
      id: derived.id,
      to: derived.id ? toLink(derived.id) : undefined,
      bio_short: derived.bioShort,
      specialties: derived.specialties,
    }
  }

  const profileProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Profile => {
    const derived = derive(target)
    return {
      ...cellProps(target),
      bio_long: derived.bioLong,
    }
  }

  return { pillProps, cellProps, profileProps }
}
