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
 * Pill = user.avatar + user.display_name + profile.subtitle.
 */
export function useChefInterface(
  profile: ProfileRefs<ChefProfile>,
  user: Ref<User | null>
) {
  // Guardrail: keep the pill minimal—canonical user name/avatar + profile subtitle only.
  const pill = computed<ChefCard.Pill | null>(() => {
    const u = user.value
    if (!u) return null

    return {
      avatar: u.avatar ?? '',
      title: u.display_name ?? '',
      subtitle: profile.coreProfile.value?.subtitle ?? '',
      badges: [],
      to: routeFor(u.id),
    }
  })

  return { pill }
}

export const resolveChefPill = (
  profile?: ChefProfile | null
): ChefCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle: profile?.subtitle ?? '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveChefPillKey = (pill: ChefCard.Pill) =>
  pill.to ?? pill.title ?? 'chef'
