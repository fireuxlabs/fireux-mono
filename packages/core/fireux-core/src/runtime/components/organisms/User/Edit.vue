<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="user?.avatar"
        :alt="user?.display_name || 'User'"
        :collection="'users'"
        :id="user?.id"
        :auto-update="true"
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

const props = defineProps<{ user: User }>()
const { user } = props

const { updateDisplayName } = useUserUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
</script>
