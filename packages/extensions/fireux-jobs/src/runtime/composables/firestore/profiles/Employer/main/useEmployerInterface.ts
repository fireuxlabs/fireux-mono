import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type {
  EmployerProfile,
  EmployerCard,
} from '../../../../../models/profiles/Employer.model.ts'

const DEFAULT_INITIALS = 'A'
const toLink = (id?: string | null) => (id ? `/profiles/${id}` : '')

const initialsFrom = (source?: string | null) => {
  const value = (source ?? '').trim()
  return value ? value.charAt(0).toUpperCase() : DEFAULT_INITIALS
}

export function useEmployerInterface(profile: ProfileRefs<EmployerProfile>) {
  const core = () => profile.coreProfile.value ?? null
  const appOverlay = () => profile.appProfile.value ?? null

  const derive = (target?: EmployerProfile | null) => {
    const overlay: Partial<EmployerProfile> | null =
      target ?? appOverlay() ?? null
    const base: Partial<EmployerProfile> | null = target ? null : core()

    const pick = <T>(
      selector: (p: Partial<EmployerProfile>) => T | null | undefined
    ): T | undefined =>
      (overlay && selector(overlay)) ?? (base && selector(base)) ?? undefined

    const id = pick((p) => p.id) ?? ''
    const title =
      pick((p) => p.title) ?? pick((p) => p.organization_name) ?? 'Employer'
    const subtitle = pick((p) => p.subtitle) ?? 'employer'
    const avatar = pick((p) => p.avatar_url) ?? pick((p) => p.avatar) ?? ''
    const badgesCandidate = pick((p) => p.locations) ?? pick((p) => p.badges)
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

  const pillProps = (target?: EmployerProfile | null): EmployerCard.Pill => {
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

  const cellProps = (target?: EmployerProfile | null): EmployerCard.Cell => {
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
    target?: EmployerProfile | null
  ): EmployerCard.Profile => {
    const derived = derive(target)
    return {
      ...cellProps(target),
      bio_long: derived.bioLong,
    }
  }

  return { pillProps, cellProps, profileProps }
}
