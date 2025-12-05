<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Edit/Core.vue -->
<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6">
      <!-- Avatar -->
      <UCard>
        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsFirestoreAvatarPicker
            :src="avatarSrc"
            :alt="app.app_name || app.id || 'App'"
            :initials="avatarInitials"
            :update-function="handleAvatarUpdate"
          />
          <p v-if="avatarUploading" class="text-xs text-gray-500">
            Uploading avatar…
          </p>
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">About</h3>
              <p class="text-xs text-gray-500">
                Keep the human-facing description up to date.
              </p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Description"
            type="textarea"
            :rows="3"
            :maxlength="500"
            :firebase-value="app.description"
            placeholder="Describe your application..."
            :update-function="handleDescriptionUpdate"
          />
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Social</h3>
              <p class="text-xs text-gray-500">
                Link tenant-visible marketing or support channels.
              </p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Instagram"
            type="url"
            :firebase-value="app.social_links?.instagram"
            placeholder="https://instagram.com/your-app"
            :update-function="handleUpdateInstagram"
          />
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Join Requests</h3>
              <p class="text-xs text-gray-500">
                Approve to add new members or clear pending invites.
              </p>
            </div>
          </div>
        </template>

        <div v-if="joinRequestItems.length" class="fx-section__item">
          <MoleculesFormsFirestoreListActions
            :items="joinRequestItems"
            :action-approve="onApprove"
            :action-reject="onRemove"
            approve-label="Approve"
            reject-label="Remove"
          />
        </div>
        <p v-else class="fx-section__empty">No pending requests.</p>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Team</h3>
              <p class="text-xs text-gray-500">
                Current tenant member document identifiers.
              </p>
            </div>
          </div>
        </template>

        <div v-if="teamIds.length" class="fx-section__item">
          <ul class="fx-section__grid font-mono text-[0.75rem]">
            <li v-for="id in teamIds" :key="id">{{ id }}</li>
          </ul>
        </div>
        <p v-else class="fx-section__empty">No members yet.</p>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="app settings" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useAppUpdate } from 'fireux-core/runtime/composables/firestore/core/app/mutations/useAppUpdate.ts'
import { useAppUsers } from 'fireux-core/runtime/composables/firestore/core/app/data/users.ts'
import { useAppJoinRequests } from 'fireux-core/runtime/composables/firestore/core/app/utils/useAppJoinRequests.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useUserFetch } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import { useToastify } from '../../../../composables/ui/useToastify.ts'

const props = defineProps<{ app: App }>()

const appRef = computed(() => props.app)
const appIdRef = computed(() => props.app.id ?? null)
const app = appRef

const toast = useToastify()

const { updateDescription, updateInstagram, uploadAvatar, handleJoinRequests } =
  useAppUpdate(appRef)
const { users } = useAppUsers()
const { pillProps } = useUser()

const avatarSrc = computed(
  () =>
    app.value?.avatar_url ||
    app.value?.logo_url ||
    app.value?.wordmark_url ||
    ''
)

const avatarInitials = computed(() => {
  const name = app.value?.app_name || app.value?.id || 'A'
  return name.slice(0, 2).toUpperCase()
})

const withToast =
  <T>(operation: (value: T) => Promise<unknown>, ok: string, fail: string) =>
  async (value: T) => {
    try {
      await operation(value)
      toast.success(ok)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.'
      toast.error(`${fail}: ${message}`)
      throw error
    }
  }

const handleDescriptionUpdate = withToast(
  updateDescription,
  'App description updated',
  'Failed to update description'
)

const handleUpdateInstagram = withToast(
  updateInstagram,
  'Instagram link saved',
  'Failed to update Instagram link'
)

const avatarUploading = ref(false)
const handleAvatarUpdate = async (file: File) => {
  avatarUploading.value = true
  try {
    await uploadAvatar(file)
    toast.success('Avatar updated')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update avatar: ${message}`)
    throw error
  } finally {
    avatarUploading.value = false
  }
}

const fetchedUser = (uid: string) => {
  const { coreUser } = useUserFetch(uid)
  return { user: computed(() => coreUser.value ?? null) }
}

const pillPropsRef = computed(() => pillProps)

const {
  items: joinRequestItems,
  approve: approveJoinRequest,
  reject: rejectJoinRequest,
} = useAppJoinRequests({
  app: appRef,
  handleJoinRequests,
  fetchedUser,
  pillProps: pillPropsRef,
})

const teamIds = computed(() =>
  (users.value ?? [])
    .map((entry) => (entry?.id ?? '').trim())
    .filter((id) => id.length > 0)
)

const onApprove = withToast(
  (uid: string) => approveJoinRequest(uid),
  'Join request approved',
  'Failed to approve request'
)

const onRemove = withToast(
  (uid: string) => rejectJoinRequest(uid),
  'Join request removed',
  'Failed to remove request'
)
</script>
