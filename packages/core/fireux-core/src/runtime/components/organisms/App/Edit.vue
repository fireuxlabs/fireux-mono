<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Edit.vue -->
<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6">
      <!-- About -->
      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Description"
          type="textarea"
          :rows="3"
          :maxlength="500"
          :firebase-value="app.description"
          placeholder="Describe your application..."
          :update-function="handleDescriptionUpdate"
        />
      </UCard>

      <!-- Social (Instagram) -->
      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Instagram"
          type="url"
          :firebase-value="app.social_links?.instagram"
          placeholder="https://instagram.com/your-app"
          :update-function="handleUpdateInstagram"
        />
      </UCard>

      <!-- Join Requests (with avatar + name) -->
      <UCard v-if="joinRequestItems.length">
        <div class="space-y-3">
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-gray-700">Join Requests</h3>
            <p class="text-xs text-gray-500">
              Approve to add a member to the app. Remove to just clear the
              request.
            </p>
          </div>

          <MoleculesFormsFirestoreListActions
            :items="joinRequestItems"
            :action-approve="onApprove"
            :action-reject="onRemove"
            approve-label="Approve"
            reject-label="Remove"
          />
        </div>
      </UCard>
      <UCard v-else>
        <div class="space-y-3">
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-gray-700">Join Requests</h3>
            <p class="text-xs text-gray-500">
              Approve to add a member to the app. Remove to just clear the
              request.
            </p>
          </div>

          <p class="text-xs text-gray-500">No pending requests.</p>
        </div>
      </UCard>

      <!-- Team IDs (debug) -->
      <UCard>
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Team</h3>
          <p class="text-xs text-gray-500">Current member document IDs.</p>
          <ul v-if="teamIds.length" class="space-y-1 text-xs text-gray-600">
            <li v-for="id in teamIds" :key="id" class="font-mono">
              {{ id }}
            </li>
          </ul>

          <p v-else class="text-xs text-gray-500">No members yet.</p>
        </div>
      </UCard>
    </div>

    <MoleculesNotFound v-else entity="app settings" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/_useUser.ts'
import { useAppJoinRequests } from 'fireux-core/runtime/composables/firestore/core/app/utils/useAppJoinRequests.ts'
import { useAppUpdate } from 'fireux-core/runtime/composables/firestore/core/app/useAppUpdate.ts'
import { useAppUsers } from 'fireux-core/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts'

/**
 * Join requests are handled via the shared helper so this view just wires up
 * success/failure toast messaging and renders the list molecule.
 */
const { app } = useApp()
const { fetchedUser, initialsFor, pillProps } = useUser()
const { updateDescription, updateInstagram, handleJoinRequests } =
  useAppUpdate(app)
const { users: appUsers } = useAppUsers()

const toast = useToast?.()

const createHandler =
  <T>(
    operation: (value: T) => Promise<unknown>,
    messages: { success: string; failure: string }
  ) =>
  async (value: T) => {
    try {
      await operation(value)
      toast?.add({ title: messages.success, icon: 'i-heroicons-check-circle' })
    } catch (error) {
      toast?.add({
        title: messages.failure,
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
      throw error
    }
  }

const handleDescriptionUpdate = createHandler(updateDescription, {
  success: 'App description updated',
  failure: 'Failed to update description',
})

const handleUpdateInstagram = createHandler(updateInstagram, {
  success: 'Instagram link saved',
  failure: 'Failed to update Instagram link',
})

const {
  items: joinRequestItems,
  approve: approveJoinRequest,
  reject: rejectJoinRequest,
} = useAppJoinRequests({
  app,
  handleJoinRequests,
  fetchedUser,
  pillProps,
  initialsFor,
})

const teamIds = computed(() =>
  (appUsers.value ?? [])
    .map((entry) => entry?.id?.trim())
    .filter((id): id is string => Boolean(id))
)

// Approve / Remove actions
const onApprove = createHandler((uid: string) => approveJoinRequest(uid), {
  success: 'Join request approved',
  failure: 'Failed to approve request',
})

const onRemove = createHandler((uid: string) => rejectJoinRequest(uid), {
  success: 'Join request removed',
  failure: 'Failed to remove request',
})
</script>
