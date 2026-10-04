import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { KitchenUserMembershipsResponse } from '../models/user-memberships.model.ts'

export function useKitchenUserMemberships(
  subjectUserId: MaybeRefOrGetter<string>
) {
  const { currentUser, hasAuthState } = useAuth()
  const { user: viewer, isAdmin, isDeveloper } = useUserSession()
  const userId = computed(() => String(toValue(subjectUserId) || '').trim())
  const isOwnProfile = computed(
    () => Boolean(userId.value) && viewer.value?.id === userId.value
  )
  const canInspect = computed(
    () => isOwnProfile.value || isAdmin.value || isDeveloper.value
  )

  const state = useLiveAsyncData<KitchenUserMembershipsResponse | null>(
    computed(
      () =>
        `kitchen-user-memberships:${currentUser.value?.uid || ''}:${userId.value}:${canInspect.value}`
    ),
    async (liveFetch) => {
      const user = currentUser.value
      if (
        !hasAuthState.value ||
        !user ||
        user.isAnonymous ||
        !userId.value ||
        !canInspect.value
      )
        return null
      return liveFetch<KitchenUserMembershipsResponse>(
        `/api/internal/kitchen/users/${encodeURIComponent(userId.value)}`,
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [hasAuthState] }
  )
  return {
    response: state.data,
    pending: computed(() => state.pending.value),
    error: computed(() => state.error.value),
    canInspect,
    isOwnProfile,
    refresh: state.refresh,
  }
}
