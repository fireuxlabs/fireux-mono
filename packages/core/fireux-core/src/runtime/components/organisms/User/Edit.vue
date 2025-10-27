<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <div class="space-y-6">
      <div class="flex flex-col items-center gap-2">
        <MoleculesFormsFirestoreAvatarPicker
          :src="avatar"
          :alt="avatarAlt"
          :initials="initials"
          :update-function="handleAvatarUpload"
        />
        <p v-if="avatarUploading" class="text-xs text-gray-500">
          Uploading avatar...
        </p>
      </div>

      <MoleculesFormsFirestoreSimpleField
        label="Display Name"
        :firebase-value="displayName"
        placeholder="Display name"
        :maxlength="60"
        :update-function="updateDisplayName"
        :validation-function="validateDisplayName"
        :formatting-function="formatDisplayName"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Email"
        type="email"
        :firebase-value="email"
        placeholder="user@example.com"
        :update-function="updateEmail"
        :validation-function="validateEmail"
        :formatting-function="formatEmail"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Handle"
        :firebase-value="handle"
        placeholder="your-handle"
        :update-function="updateHandle"
        :validation-function="validateHandle"
        :formatting-function="formatHandle"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Bio"
        type="textarea"
        :rows="4"
        :maxlength="280"
        :firebase-value="bio"
        placeholder="A short bio about yourself..."
        :update-function="updateBio"
        :validation-function="validateBio"
        :formatting-function="formatBio"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from '../../../composables/firestore/core/user/useUser'
import { useUserUpdate } from '../../../composables/firestore/core/user/useUserUpdate'
import { useUserFormattingAndValidation } from '../../../composables/firestore/core/user/useUserFormattingAndValidation'

const { user, initialsFor } = useUser()
const {
  updateDisplayName,
  updateHandle,
  updateEmail,
  updateBio,
  updateAvatar,
} = useUserUpdate(user)
const {
  formatDisplayName,
  validateDisplayName,
  formatHandle,
  validateHandle,
  formatEmail,
  validateEmail,
  validateBio,
  formatBio,
} = useUserFormattingAndValidation()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const displayName = computed(() => user.value?.display_name ?? '')
const email = computed(() => user.value?.email ?? '')
const handle = computed(() => user.value?.handle ?? '')
const bio = computed(() => user.value?.bio ?? '')
const avatar = computed(() => user.value?.avatar ?? '')
const avatarAlt = computed(() => displayName.value || handle.value || 'User')
const initials = computed(() => initialsFor.value(user.value ?? undefined))
const avatarUploading = ref(false)

async function handleAvatarUpload(file: File) {
  if (avatarUploading.value) return
  avatarUploading.value = true
  try {
    await updateAvatar(file)
    if (toast)
      toast.add({
        title: 'Avatar updated',
        icon: 'i-heroicons-check-circle',
      })
  } catch (err) {
    const description = err instanceof Error ? err.message : 'Please try again.'
    if (toast)
      toast.add({
        title: 'Avatar upload failed',
        description,
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
    console.error('Avatar upload failed', err)
  } finally {
    avatarUploading.value = false
  }
}
</script>
