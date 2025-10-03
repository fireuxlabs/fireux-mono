<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <div class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="avatar?.value || ''"
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
const {
  avatar,
  displayName,
  handle,
  updateDisplayName,
  updateAvatar,
  updateHandle,
  validateDisplayName,
  formatDisplayName,
  validateHandle,
  formatHandle,
} = useUser()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)
const onSaveHandle = (v: string) => updateHandle(v)
</script>

<!-- layout handled by parent; no local styles -->
