<!-- packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/ImagePicker.vue -->
<!-- Concurrent edit — 2026-07-21 15:46 CEST — User Profile polish: make the shared image action named, keyboard-accessible, and upload-aware. -->
<template>
  <div class="avatar-container">
    <UAvatar
      :src="src || ''"
      :alt="alt || 'Image'"
      :text="initials || 'I'"
      :class="['avatar', avatarClass]"
    />

    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="sr-only"
      :disabled="disabled || loading"
      @change="onFileChange"
    />

    <UButton
      type="button"
      icon="i-lucide-camera"
      color="neutral"
      variant="solid"
      size="lg"
      square
      :aria-label="buttonLabel"
      :title="buttonLabel"
      :loading="loading"
      :disabled="disabled"
      class="upload-button"
      @click="openPicker"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  src?: string
  alt?: string
  initials?: string
  avatarClass?: string
  buttonLabel?: string
  loading?: boolean
  disabled?: boolean
  // Parent-provided handler to process selected file (e.g., upload then update URL)
  updateFunction?: (file: File) => unknown
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const buttonLabel = props.buttonLabel || 'Change image'

function openPicker() {
  if (props.disabled || props.loading) return
  inputRef.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  try {
    await props.updateFunction?.(file)
  } finally {
    // Reset the input so selecting the same file still triggers a change.
    if (input) input.value = ''
  }
}
</script>

<style scoped>
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: calc(var(--spacing) * 2);
}
.avatar {
  width: 96px;
  height: 96px;
}
.upload-button {
  position: absolute;
  bottom: -6px;
  right: -6px;
  border-radius: 9999px;
  min-width: calc(var(--spacing) * 11);
  min-height: calc(var(--spacing) * 11);
}
</style>
