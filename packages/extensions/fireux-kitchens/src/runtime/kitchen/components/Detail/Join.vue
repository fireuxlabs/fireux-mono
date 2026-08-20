<template>
  <UPageCard
    v-if="showCard"
    title="Join this kitchen"
    :description="description"
    variant="subtle"
  >
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        v-if="!isAuthenticated"
        :to="authTo"
        icon="i-lucide-log-in"
        color="primary"
      >
        Sign in to request access
      </UButton>

      <UButton
        v-else-if="canRequest"
        icon="i-lucide-user-plus"
        color="primary"
        :loading="submitting"
        :disabled="submitting"
        @click="submit"
      >
        Request kitchen access
      </UButton>

      <UBadge
        v-else-if="hasPendingRequest"
        color="warning"
        variant="soft"
      >
        Request pending
      </UBadge>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { targetHasWorkspaceAccess } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import { useKitchenFetch } from '../../composables/firestore/useKitchen'
import { resolveKitchenScopeCollectionPath } from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import { useKitchenChildCollection } from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import { useKitchenTeamJoinRequestMutations } from '../../composables/workspace/team/mutations/useKitchenTeamJoinRequestMutations'
import {
  KitchenTeamJoinRequestStorage,
  type KitchenTeamJoinRequest,
} from '../../models/team.model.ts'

const props = defineProps<{
  kitchen?: KitchenSurface | null
}>()

const route = useRoute()
const toast = useToastify()
const { appId } = useFireUXConfig()
const { uid, isAuthenticated, currentUser } = useAuth()
const submitting = ref(false)
const currentAppId = computed(() => String(appId || '').trim())
const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const kitchenName = computed(() =>
  String(props.kitchen?.display_name || props.kitchen?.name || 'this kitchen').trim()
)
const operatorAppId = computed(() =>
  String(props.kitchen?.management_app_id || currentAppId.value).trim()
)
const operatorCollectionPath = computed(() =>
  operatorAppId.value ? resolveKitchenScopeCollectionPath(operatorAppId.value) : ''
)
const { kitchen: operatorKitchen } = useKitchenFetch(kitchenId, {
  collectionPath: operatorCollectionPath,
  hydrate: false,
})
const { items: joinRequests } = useKitchenChildCollection<KitchenTeamJoinRequest>(
  KitchenTeamJoinRequestStorage.collection,
  kitchenId,
  { kitchenCollectionPath: operatorCollectionPath }
)
const { createKitchenTeamJoinRequest } = useKitchenTeamJoinRequestMutations({
  kitchenCollectionPath: operatorCollectionPath,
})
const userId = computed(() => String(uid.value || '').trim())
const hasKitchenAccess = computed(() =>
  targetHasWorkspaceAccess(operatorKitchen.value, userId.value)
)
const hasPendingRequest = computed(() =>
  Boolean(
    userId.value &&
      joinRequests.value.some((request) =>
        request.user_id === userId.value && request.status === 'pending'
      )
  )
)
const showCard = computed(() =>
  Boolean(kitchenId.value && !hasKitchenAccess.value)
)
const canRequest = computed(() =>
  Boolean(isAuthenticated.value && userId.value && !hasPendingRequest.value)
)
const description = computed(() => {
  if (!isAuthenticated.value) {
    return `Sign in to request team access for ${kitchenName.value}.`
  }

  if (hasPendingRequest.value) {
    return `Your request to join ${kitchenName.value} is waiting for the kitchen team.`
  }

  return `Ask the kitchen team for access to menus, orders, and operations.`
})
const authTo = computed(
  () => `/auth?redirect=${encodeURIComponent(route.fullPath || '/')}`
)
const requesterName = computed(() =>
  String(
    currentUser.value?.displayName ||
      currentUser.value?.email ||
      userId.value
  ).trim()
)

async function submit() {
  if (!canRequest.value || submitting.value) return

  submitting.value = true
  try {
    await createKitchenTeamJoinRequest({
      kitchenId: kitchenId.value,
      userId: userId.value,
      name: requesterName.value,
      message: `Requested access from ${route.fullPath || 'public kitchen page'}.`,
    })
    toast.success('Kitchen join request sent')
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Could not send join request'
    )
  } finally {
    submitting.value = false
  }
}
</script>
