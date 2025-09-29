<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="user?.avatar"
        :storage-path="`core-users/${props.user?.id}/avatar`"
        :alt="props.user?.display_name || 'User'"
        @uploaded="onAvatarUploaded"
      />
      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="props.user?.display_name"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { User } from '../../../models/core/user.model'
import { useUserUpdate } from '../../../composables/firestore/user/useUserUpdate'

const props = defineProps<{ user: User }>()

const { updateDisplayName, updateAvatar } = useUserUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v)

const onAvatarUploaded = async (url: string) => {
  await updateAvatar(url)
}
</script>