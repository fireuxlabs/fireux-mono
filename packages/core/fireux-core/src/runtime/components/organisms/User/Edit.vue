<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <div class="space-y-6">
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
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser'
import { useUserUpdate } from 'fireux-core/runtime/composables/firestore/core/user/useUserUpdate'
import { useUserFormattingAndValidation } from 'fireux-core/runtime/composables/firestore/core/user/useUserFormattingAndValidation'

const { user } = useUser()
const { updateDisplayName, updateHandle, updateEmail, updateBio } =
  useUserUpdate(user)
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

const displayName = computed(() => user.value?.display_name ?? '')
const email = computed(() => user.value?.email ?? '')
const handle = computed(() => user.value?.handle ?? '')
const bio = computed(() => user.value?.bio ?? '')
</script>
