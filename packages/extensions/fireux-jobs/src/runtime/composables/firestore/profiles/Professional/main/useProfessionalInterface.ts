// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/main/useProfessionalInterface.ts

import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
  type ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Super simple Professional interface (stub)
 * - user is REQUIRED (Ref<User | null>)
 * - core/app are wired but not used yet
 * - everything is driven by the core user
 */
export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>,
  user: Ref<User | null>
) {
  // placeholders for future use
  const core = () => profile.coreProfile.value
  const app = () => profile.appProfile.value
  void core
  void app

  const pill = computed<ProfessionalCard.Pill | null>(() => {
    const value = user.value
    if (!value) return null

    return {
      avatar: value.avatar ?? '',
      title: value.display_name ?? '',
      subtitle: value.handle ? `@${value.handle}` : '',
      to: `/${professionalConfig.collectionName}/${value.id}`,
    }
  })

  const cell = computed<ProfessionalCard.Cell | null>(() => {
    const value = user.value
    if (!value) return null

    return {
      id: value.id,
      avatar: value.avatar ?? '',
      title: value.display_name ?? '',
      subtitle: value.handle ? `@${value.handle}` : '',
      to: `/${professionalConfig.collectionName}/${value.id}`,
    }
  })

  const profileCore = computed<ProfessionalCard.ProfileCore | null>(() => {
    const value = user.value
    if (!value) return null

    return {
      id: value.id,
      avatar: value.avatar ?? '',
      title: value.display_name ?? '',
      subtitle: value.handle ? `@${value.handle}` : '',
      to: `/${professionalConfig.collectionName}/${value.id}`,
    }
  })

  const profileApp = computed<ProfessionalCard.ProfileApp | null>(() => {
    const value = user.value
    if (!value) return null

    return {
      id: value.id,
      avatar: value.avatar ?? '',
      title: value.display_name ?? '',
      subtitle: value.handle ? `@${value.handle}` : '',
      to: `/${professionalConfig.collectionName}/${value.id}`,
    }
  })

  return {
    pill,
    cell,
    profileCore,
    profileApp,
  }
}
