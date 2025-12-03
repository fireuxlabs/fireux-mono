// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/main/useProfessionalInterface.ts

import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
  type ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${professionalConfig.collectionName}/${id}` : null

/**
 * Minimal professional interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile tagline.
 */
export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>,
  user: Ref<User | null>
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

  const resolveTitle = (u: User) =>
    u.display_name?.trim() ||
    u.email?.trim() ||
    (u.handle ? `@${u.handle.trim()}` : '') ||
    'Professional'

  const pillProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Pill | null => {
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
  ): ProfessionalCard.Cell | null => {
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

export const resolveProfessionalPill = (
  profile?: ProfessionalProfile | null
): ProfessionalCard.Pill => ({
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

export const resolveProfessionalPillKey = (pill: ProfessionalCard.Pill) =>
  pill.to ?? pill.title ?? 'professional'
