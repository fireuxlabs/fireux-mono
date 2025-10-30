<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit.vue -->
<template>
  <ClientOnly>
    <div v-if="user" class="space-y-6">
      <UCard>
        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsFirestoreAvatarPicker
            :src="user.avatar"
            :alt="user.display_name || user.handle || 'User'"
            :initials="initialsFor(user || undefined)"
            :update-function="handleAvatarUpload"
          />
          <p v-if="avatarUploading" class="text-xs text-gray-500">
            Uploading avatar…
          </p>
        </div>
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Display Name"
          :firebase-value="user.display_name"
          placeholder="Display name"
          :maxlength="60"
          :update-function="handleUpdateDisplayName"
          :validation-function="validateDisplayName"
          :formatting-function="formatDisplayName"
        />
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Email"
          type="email"
          :firebase-value="user.email"
          placeholder="user@example.com"
          :update-function="handleUpdateEmail"
          :validation-function="validateEmail"
          :formatting-function="formatEmail"
        />
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Handle"
          :firebase-value="user.handle"
          placeholder="your-handle"
          :update-function="handleUpdateHandle"
          :validation-function="validateHandle"
          :formatting-function="formatHandle"
        />
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Bio"
          type="textarea"
          :rows="4"
          :maxlength="280"
          :firebase-value="user.bio"
          placeholder="A short bio about yourself..."
          :update-function="handleUpdateBio"
          :validation-function="validateBio"
          :formatting-function="formatBio"
        />
      </UCard>
    </div>

    <MoleculesNotFound v-else entity="profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from '../../../composables/firestore/core/user/useUser.ts'
import { useUserFormattingAndValidation } from '../../../composables/firestore/core/user/utils/forms/useUserFormatting.ts'

const {
  user,
  initialsFor,
  updateDisplayName,
  updateHandle,
  updateEmail,
  updateBio,
  updateAvatar,
} = useUser()

const {
  formatDisplayName,
  validateDisplayName,
  formatHandle,
  validateHandle,
  formatEmail,
  validateEmail,
  formatBio,
  validateBio,
} = useUserFormattingAndValidation()

const toast = useToast?.()

type Messages = { success: string; failure: string }

const createHandler =
  <T>(op: (v: T) => Promise<unknown>, m: Messages) =>
  async (value: T) => {
    try {
      await op(value)
      toast?.add({ title: m.success, icon: 'i-heroicons-check-circle' })
    } catch (error) {
      toast?.add({
        title: m.failure,
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
      throw error
    }
  }

// Field handlers (aligned with App/Edit.vue pattern)
const handleUpdateDisplayName = createHandler(updateDisplayName, {
  success: 'Display name updated',
  failure: 'Failed to update display name',
})
const handleUpdateEmail = createHandler(updateEmail, {
  success: 'Email updated',
  failure: 'Failed to update email',
})
const handleUpdateHandle = createHandler(updateHandle, {
  success: 'Handle updated',
  failure: 'Failed to update handle',
})
const handleUpdateBio = createHandler(updateBio, {
  success: 'Bio updated',
  failure: 'Failed to update bio',
})

// Avatar upload (file-based op kept explicit)
const avatarUploading = ref(false)
async function handleAvatarUpload(file: File) {
  if (avatarUploading.value) return
  avatarUploading.value = true
  try {
    await updateAvatar(file)
    toast?.add({ title: 'Avatar updated', icon: 'i-heroicons-check-circle' })
  } catch (err) {
    toast?.add({
      title: 'Avatar upload failed',
      description: err instanceof Error ? err.message : 'Please try again.',
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    console.error('Avatar upload failed', err)
  } finally {
    avatarUploading.value = false
  }
}
</script>
