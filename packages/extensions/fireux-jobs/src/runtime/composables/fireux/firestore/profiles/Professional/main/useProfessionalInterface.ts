// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface.ts

import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../../../models/profiles/Professional/Professional.model'

/**
 * UI-only view models for Professional profiles.
 * Keep these out of the Firestore model file.
 */
export namespace ProfessionalCard {
  /** Pill model (UI header chip) */
  export interface ProfessionalPill {
    avatar?: string
    title?: string
    subtitle?: string | null
    tagline?: string | null
    badges?: string[]
    to?: string | null
  }

  /** Cell model (directory list item) */
  export interface ProfessionalCell extends ProfessionalPill {
    id?: string
    bio_short?: string | null
    specialties?: string[]
    locations?: string[]
  }

  /** Full profile surface for display components */
  export type ProfessionalProfileCard = ProfessionalProfile
}

const routeFor = (id?: string | null): string | undefined =>
  id ? `/${professionalConfig.collectionName}/${id}` : undefined

/**
 * Minimal professional interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile tagline.
 */
export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>,
  user: Ref<User | null | undefined>
) {
  const resolveProfile = (target?: ProfessionalProfile | null) =>
    target ?? profile.coreProfile.value ?? null

  const resolveUser = (target?: ProfessionalProfile | null) =>
    target?.user ?? user.value ?? null

  const resolveTagline = (
    payload: ProfessionalProfile | null | undefined
  ): string =>
    payload?.tagline?.trim() ??
    (payload as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    ''

  const resolveTitle = (u: Partial<User>) =>
    u.display_name?.trim() ||
    u.email?.trim() ||
    (u.handle ? `@${u.handle.trim()}` : '') ||
    'Professional'

  const pillProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.ProfessionalPill | null => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser(target)
    if (!currentUser) return null

    const tagline = resolveTagline(currentProfile)
    const to = routeFor(currentProfile?.id ?? currentUser.id)

    return {
      avatar: currentUser.avatar ?? '',
      title: resolveTitle(currentUser),
      subtitle: tagline,
      tagline,
      badges: currentProfile?.badges ?? [],
      to,
    }
  }

  const cellProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.ProfessionalCell | null => {
    const base = pillProps(target)
    if (!base) return null

    const currentProfile = resolveProfile(target)
    const id = currentProfile?.id ?? resolveUser(target)?.id ?? undefined

    return {
      ...base,
      id,
      bio_short: currentProfile?.bio_short ?? null,
      specialties: currentProfile?.specialties ?? [],
    }
  }

  const pill = computed(() => pillProps())
  const cell = computed(() => cellProps())

  return { pill, cell, pillProps, cellProps }
}

export const resolveProfessionalCell = (
  profile?: ProfessionalProfile | null,
  fallbackId = 'professional-profile'
): ProfessionalCard.ProfessionalCell | null => {
  if (!profile) return null

  const user = profile.user ?? undefined

  const id = profile.id ?? user?.id ?? fallbackId

  const subtitle = profile.subtitle ?? null
  const tagline = (profile as { tagline?: string | null } | null)?.tagline ?? null

  return {
    id,
    avatar: user?.avatar ?? undefined,
    title: user?.display_name ?? profile.title ?? 'Professional',
    subtitle,
    tagline,
    badges: profile.badges ?? [],
    bio_short: (profile as { bio_short?: string | null } | null)?.bio_short ?? null,
    specialties: (profile as { specialties?: string[] } | null)?.specialties ?? [],
    locations: (profile as { locations?: string[] } | null)?.locations ?? [],
    to: routeFor(profile.id),
  }
}

export const resolveProfessionalPill = (
  profile?: ProfessionalProfile | null
): ProfessionalCard.ProfessionalPill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name?.trim() || '',
  subtitle:
    profile?.tagline?.trim() ??
    (profile as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    '',
  tagline:
    profile?.tagline?.trim() ??
    (profile as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveProfessionalPillKey = (pill: ProfessionalCard.ProfessionalPill) =>
  pill.to ?? pill.title ?? 'professional'
