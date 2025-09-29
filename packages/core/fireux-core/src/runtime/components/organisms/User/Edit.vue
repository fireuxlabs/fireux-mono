<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="user?.avatar"
        :alt="user?.display_name || 'User'"
        :update-function="onSaveAvatar"
      />
      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="user?.display_name"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { User } from '../../../models/core/user.model'
import { useUserUpdate } from '../../../composables/firestore/user/useUserUpdate'

defineProps<{ user: User }>()

const { updateDisplayName, updateAvatar } = useUserUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)
</script>
