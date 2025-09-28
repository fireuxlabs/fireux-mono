<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <!-- Avatar -->
      <MoleculesFormsFirestoreAvatarSelection
        :user="{ ...props.user, avatar_url: props.user?.avatar }"
        @upload="onUploadAvatar"
      />
      <!-- Display Name -->
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
import { useMediaStorage } from '../../../composables/firebase/useMediaStorage'

const props = defineProps<{ user: User }>()

const { updateDisplayName, updateAvatar } = useUserUpdate()
const { uploadCoreAvatar } = useMediaStorage()

const onSaveDisplayName = (v: string) => updateDisplayName(v)

const onUploadAvatar = async (file: File) => {
  if (!props.user?.id) return
  const url = await uploadCoreAvatar(file, props.user.id)
  if (url) await updateAvatar(url)
}
</script>
