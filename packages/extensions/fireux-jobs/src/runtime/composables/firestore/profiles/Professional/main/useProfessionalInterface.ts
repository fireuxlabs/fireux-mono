// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/main/useProfessionalInterface.ts

import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const DEFAULT_TITLE = 'Professional'

const normalizeBadgeList = (source?: string[] | null) =>
  Array.isArray(source) ? (source.filter(Boolean) as string[]) : []

const normalizeSpecialties = (source?: string[] | null) =>
  Array.isArray(source) ? (source.filter(Boolean) as string[]) : []

const resolveSubtitle = (
  user: User,
  profile?: Partial<ProfessionalProfile> | null
) => {
  if (user.handle) return `@${user.handle}`
  const candidate = profile?.subtitle
  return candidate ?? ''
}

const resolveTitle = (
  user: User,
  profile?: Partial<ProfessionalProfile> | null
) =>
  profile?.display_name?.trim() ||
  user.display_name?.trim() ||
  profile?.title?.trim() ||
  DEFAULT_TITLE

const resolveAvatar = (
  user: User,
  profile?: Partial<ProfessionalProfile> | null
) => profile?.avatar ?? profile?.avatar_url ?? user.avatar ?? ''

const resolveId = (user: User, profile?: Partial<ProfessionalProfile> | null) =>
  profile?.id ?? user.id

const buildCell = (
  user: User,
  profile?: Partial<ProfessionalProfile> | null
): ProfessionalCard.Cell => {
  const id = resolveId(user, profile)
  return {
    id,
    avatar: resolveAvatar(user, profile),
    title: resolveTitle(user, profile),
    subtitle: resolveSubtitle(user, profile),
    to: id ? `/professionals/${id}` : undefined,
    badges: normalizeBadgeList(profile?.badges),
    bio_short: profile?.bio_short ?? null,
    specialties: normalizeSpecialties(profile?.specialties ?? []),
  }
}

const buildProfileCore = (
  cell: ProfessionalCard.Cell,
  profile?: Partial<ProfessionalProfile> | null
): ProfessionalCard.ProfileCore => ({
  ...cell,
  badges: normalizeBadgeList(profile?.badges ?? cell.badges),
  health_certifications: normalizeBadgeList(
    (profile as ProfessionalProfile | undefined)?.health_certifications
  ),
  bio_long: profile?.bio_long ?? null,
  relevant_experience: Array.isArray(
    (profile as ProfessionalProfile | undefined)?.relevant_experience
  )
    ? (profile as ProfessionalProfile).relevant_experience
    : undefined,
  other_experience: Array.isArray(
    (profile as ProfessionalProfile | undefined)?.other_experience
  )
    ? (profile as ProfessionalProfile).other_experience
    : undefined,
})

const buildProfileApp = (
  cell: ProfessionalCard.Cell,
  profile?: Partial<ProfessionalProfile> | null
): ProfessionalCard.ProfileApp => ({
  ...cell,
  bio_short: profile?.bio_short ?? cell.bio_short,
  specialties: normalizeSpecialties(profile?.specialties ?? cell.specialties),
})

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>,
  user: Ref<User | null>
) {
  const coreProfile = () => profile.coreProfile.value ?? null
  const appProfile = () => profile.appProfile.value ?? null

  const pill = computed<ProfessionalCard.Pill | null>(() => {
    const value = user.value
    if (!value) return null
    const source = appProfile() ?? coreProfile()
    const base = buildCell(value, source)
    return {
      avatar: base.avatar,
      title: base.title,
      subtitle: base.subtitle,
      badges: base.badges,
      to: base.to ?? null,
    }
  })

  const cell = computed<ProfessionalCard.Cell | null>(() => {
    const value = user.value
    if (!value) return null
    const source = appProfile() ?? coreProfile()
    return buildCell(value, source)
  })

  const profileCore = computed<ProfessionalCard.ProfileCore | null>(() => {
    const value = user.value
    if (!value) return null
    const source = coreProfile()
    const base = buildCell(value, source)
    return buildProfileCore(base, source)
  })

  const profileApp = computed<ProfessionalCard.ProfileApp | null>(() => {
    const value = user.value
    if (!value) return null
    const source = appProfile()
    const base = buildCell(value, source)
    return buildProfileApp(base, source)
  })

  return {
    pill,
    cell,
    profileCore,
    profileApp,
  }
}
