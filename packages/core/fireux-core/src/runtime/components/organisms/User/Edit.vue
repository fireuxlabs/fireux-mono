<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <div class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="avatarSrc"
        :alt="displayName || 'User'"
        :update-function="onSaveAvatar"
      />
      <MoleculesFormsFirestoreSimpleField
        label="Display Name"
        :firebase-value="displayName"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
        :validation-function="validateDisplayName"
        :formatting-function="formatDisplayName"
      />
      <MoleculesFormsFirestoreSimpleField
        label="Handle"
        :firebase-value="handle"
        placeholder="your-handle"
        :update-function="onSaveHandle"
        :validation-function="validateHandle"
        :formatting-function="formatHandle"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { User } from '../../../models/core/user.model'
import { useUserUpdate } from '../../../composables/firestore/user/useUserUpdate'
import { useUserComputed } from '../../../composables/firestore/user/useUserComputed'
import { toRef } from 'vue'
const props = defineProps<{ user: User }>()
const userRef = toRef(props, 'user')
const { displayName, avatarSrc, handle } = useUserComputed(userRef)

const { updateDisplayName, updateAvatar, updateHandle } = useUserUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)
const onSaveHandle = (v: string) => updateHandle(v)

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

function validateHandle(raw: string) {
  const value = String(raw || '').trim()
  if (!value) return { isValid: true } // allow clearing
  const normalized = value.toLowerCase()
  if (normalized.length < 3)
    return { isValid: false, message: 'Handle too short.' }
  if (normalized.length > 30)
    return { isValid: false, message: 'Handle too long.' }
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return {
      isValid: false,
      message: 'Use lowercase letters, numbers, and dashes only.',
    }
  }
  return { isValid: true }
}

function formatHandle(raw: string) {
  // normalize: lowercase, spaces to dashes, strip invalid chars, collapse dashes
  let s = String(raw || '')
    .trim()
    .toLowerCase()
  s = s.replace(/^@+/, '') // drop leading @ if user typed it
  s = s.replace(/\s+/g, '-')
  s = s.replace(/[^a-z0-9-]/g, '')
  s = s.replace(/-+/g, '-')
  s = s.replace(/^-|-$|_/g, '')
  return s.slice(0, 30)
}

/* minimal: parent panel provides layout and account preview */
</script>

<!-- no extra local styles; parent panel manages layout/visual context -->
