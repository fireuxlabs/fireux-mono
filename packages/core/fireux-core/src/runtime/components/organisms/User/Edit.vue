<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="avatarSrc"
        :alt="displayName || 'User'"
        :update-function="onSaveAvatar"
      />
      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="displayName"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
        :validation-function="validateDisplayName"
        :formatting-function="formatDisplayName"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { User } from '../../../models/core/user.model'
import { useUserUpdate } from '../../../composables/firestore/user/useUserUpdate'
import { useUserComputed } from '../../../composables/firestore/user/useUserComputed'
import { toRef } from 'vue'
const props = defineProps<{ user: User }>()
const userRef = toRef(props, 'user')
const { displayName, avatarSrc } = useUserComputed(userRef)

const { updateDisplayName, updateAvatar } = useUserUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)

function validateDisplayName(name: string) {
  const value = (name || '').trim()
  if (!value) return { isValid: false, message: 'Name cannot be empty.' }
  if (value.length < 2) return { isValid: false, message: 'Name is too short.' }
  if (value.length > 60) return { isValid: false, message: 'Name is too long.' }
  return { isValid: true }
}

function formatDisplayName(name: string) {
  const value = (name || '').trim()
  // Title-case words, preserve internal casing for short tokens
  return value
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}
</script>
