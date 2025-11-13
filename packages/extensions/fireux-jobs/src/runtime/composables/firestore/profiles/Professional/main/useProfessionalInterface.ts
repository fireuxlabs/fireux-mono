import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'

type CtaAction = {
  id: string
  label: string
  to?: string | null
  color?: string
  variant?: string
}

type CtaDescriptor = {
  title: string
  description?: string
  actions: CtaAction[]
}

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>
) {
  const core = () => profile.coreProfile.value ?? null
  const overlay = () => profile.appProfile.value ?? null

  const toPath = (id?: string | null) => (id ? `/professionals/${id}` : '')

  const resolve = (target?: ProfessionalProfile | null) => {
    if (target) return target
    const base = core()
    const app = overlay()
    if (!base && !app) return null
    if (base && app) return { ...base, ...app }
    return base ?? app ?? null
  }

  const badgesFrom = (source?: ProfessionalProfile | null) => {
    if (!source) return [] as string[]
    const { health_certifications, badges, specialties } = source
    if (Array.isArray(health_certifications) && health_certifications.length)
      return health_certifications
    if (Array.isArray(badges) && badges.length) return badges
    if (Array.isArray(specialties) && specialties.length) return specialties
    return [] as string[]
  }

  const specialtiesFrom = (source?: ProfessionalProfile | null) => {
    const list = source?.specialties
    return Array.isArray(list) ? [...list] : []
  }

  const derive = (target?: ProfessionalProfile | null) => {
    const profileValue = resolve(target)
    return {
      id: profileValue?.id ?? '',
      title:
        profileValue?.title ?? profileValue?.display_name ?? 'Professional',
      subtitle: profileValue?.subtitle ?? 'professional',
      avatar: profileValue?.avatar_url ?? profileValue?.avatar ?? '',
      badges: badgesFrom(profileValue),
      specialties: specialtiesFrom(profileValue),
      bioShort: profileValue?.bio_short ?? '',
      bioLong: profileValue?.bio_long ?? '',
    }
  }

  const pillProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Pill => {
    const derived = derive(target)
    return {
      avatar: derived.avatar,
      title: derived.title,
      subtitle: derived.subtitle,
      badges: derived.badges,
      to: derived.id ? toPath(derived.id) : null,
    }
  }

  const cellProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Cell => {
    const derived = derive(target)
    return {
      ...pillProps(target),
      id: derived.id,
      to: derived.id ? toPath(derived.id) : undefined,
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

  const ctaFor = (target?: ProfessionalProfile | null): CtaDescriptor => {
    const profileValue = resolve(target)
    if (profileValue) {
      return {
        title: 'Professional profile ready',
        description: 'Keep your experience current so employers can reach out.',
        actions: [
          {
            id: 'edit-professional',
            label: 'Open dashboard',
            to: '/dashboard/professional-profile',
            color: 'primary',
          },
        ],
      }
    }

    return {
      title: 'Create your Professional profile to appear in listings.',
      description: 'Share your experience so employers can learn about you.',
      actions: [
        {
          id: 'create-professional',
          label: 'Create Professional Profile',
          to: '/dashboard/professional-profile',
          color: 'primary',
        },
      ],
    }
  }

  return { pillProps, cellProps, profileProps, ctaFor }
}
