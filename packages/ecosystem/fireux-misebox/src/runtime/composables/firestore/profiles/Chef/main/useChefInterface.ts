import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  chefConfig,
  type ChefProfile,
  type ChefCard,
} from '../../../../../models/profiles/Chef.model.ts'

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
  const resolveTagline = (
    payload: { tagline?: string | null } | null | undefined
  ): string =>
    payload?.tagline ??
    (payload as { subtitle?: string | null } | null)?.subtitle ??
    ''

  // Guardrail: keep the pill minimal—canonical user name/avatar + profile tagline only.
  const pill = computed<ChefCard.Pill | null>(() => {
    const u = user.value
    if (!u) return null

    const tagline = resolveTagline(profile.coreProfile.value).trim()

    return {
      avatar: u.avatar ?? '',
      title: u.display_name ?? '',
      subtitle: tagline,
      tagline,
      badges: [],
      to: routeFor(u.id),
    }
  })

  const cell = computed<ChefCard.Cell | null>(() => {
    const pillValue = pill.value
    const core = profile.coreProfile.value

    if (!pillValue) return null

    return {
      ...pillValue,
      bio_short: core?.bio_short ?? null,
    }
  })

  return { pill, cell }
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
