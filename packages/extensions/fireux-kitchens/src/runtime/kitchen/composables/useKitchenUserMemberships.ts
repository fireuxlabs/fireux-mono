import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { KitchenUserMembershipsResponse } from '../models/user-memberships.model.ts'

export function useKitchenUserMemberships(
  subjectUserId: MaybeRefOrGetter<string>
) {
  const { currentUser, hasAuthState } = useAuth()
  const { user: viewer, isAdmin, isDeveloper } = useUserSession()
  const response = ref<KitchenUserMembershipsResponse | null>(null)
  const pending = ref(false)
  const error = ref<unknown>()
  let requestSequence = 0

  const userId = computed(() => String(toValue(subjectUserId) || '').trim())
  const isOwnProfile = computed(
    () => Boolean(userId.value) && viewer.value?.id === userId.value
  )
  const canInspect = computed(
    () => isOwnProfile.value || isAdmin.value || isDeveloper.value
  )

  const load = async () => {
    const sequence = ++requestSequence
    const authUser = currentUser.value
    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !authUser ||
      authUser.isAnonymous ||
      !userId.value ||
      !canInspect.value
    ) {
      response.value = null
      pending.value = false
      error.value = undefined
      return
    }

    pending.value = true
    error.value = undefined
    try {
      const token = await authUser.getIdToken()
      const result = await $fetch<KitchenUserMembershipsResponse>(
        `/api/internal/kitchen/users/${encodeURIComponent(userId.value)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (sequence !== requestSequence) return
      response.value = result
    } catch (cause) {
      if (sequence !== requestSequence) return
      response.value = null
      error.value = cause
    } finally {
      if (sequence === requestSequence) pending.value = false
    }
  }

  watch([userId, currentUser, hasAuthState, canInspect], () => void load(), {
    immediate: true,
  })

  return {
    response,
    pending: computed(() => pending.value),
    error: computed(() => error.value),
    canInspect,
    isOwnProfile,
    refresh: load,
  }
}

