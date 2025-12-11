import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import {
  chefConfig,
  type ChefProfile,
  type ChefCard,
} from '../../../../../../models/profiles/Chef/Chef.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${chefConfig.collectionName}/${id}` : null

/**
 * Minimal chef interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile tagline.
 */
export function useChefInterface(
  profile: ProfileRefs<ChefProfile>,
  user: Ref<User | null>
) {
  const resolveProfile = (target?: ChefProfile | null) =>
    target ?? profile.coreProfile.value ?? null

  const resolveUser = (target?: ChefProfile | null) =>
    target?.user ?? user.value ?? null

  const resolveTagline = (payload: ChefProfile | null | undefined): string =>
    payload?.tagline?.trim() ??
    (payload as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    ''

  const resolveTitle = (u: Partial<User>) =>
    u.display_name?.trim() ||
    u.email?.trim() ||
    (u.handle ? `@${u.handle.trim()}` : '') ||
    'Chef'

  const pillProps = (target?: ChefProfile | null): ChefCard.Pill | null => {
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

  const cellProps = (target?: ChefProfile | null): ChefCard.Cell | null => {
    const base = pillProps(target)
    if (!base) return null

    const currentProfile = resolveProfile(target)
    const id = currentProfile?.id ?? resolveUser(target)?.id ?? undefined

    return {
      ...base,
      id,
      bio_short: currentProfile?.bio_short ?? null,
    }
  }

  const pill = computed(() => pillProps())
  const cell = computed(() => cellProps())

  return { pill, cell, pillProps, cellProps }
}

export const resolveChefPill = (
  profile?: ChefProfile | null
): ChefCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle:
    profile?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    '',
  tagline:
    profile?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveChefPillKey = (pill: ChefCard.Pill) =>
  pill.to ?? pill.title ?? 'chef'
