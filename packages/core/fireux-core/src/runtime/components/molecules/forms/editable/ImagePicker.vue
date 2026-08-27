<!-- packages/core/fireux-core/src/runtime/components/molecules/forms/editable/ImagePicker.vue -->
<!-- Concurrent edit — 2026-07-21 15:46 CEST — User Profile polish: make the shared image action named, keyboard-accessible, and upload-aware. -->
<template>
  <div class="avatar-container">
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="sr-only"
      :disabled="disabled || loading"
      @change="onFileChange"
    />

    <button
      type="button"
      :aria-label="buttonLabel"
      :title="buttonLabel"
      :disabled="disabled || loading"
      class="avatar-button"
      @click="openPicker"
    >
      <UChip
        position="bottom-right"
        inset
        color="primary"
        :ui="{ base: 'size-5 p-0 ring-2 ring-bg' }"
      >
        <UAvatar
          :src="src || ''"
          :alt="alt || 'Image'"
          :text="initials || 'I'"
          :size="size"
          :class="[!size && 'avatar', avatarClass]"
        />
        <template #content>
          <UIcon
            :name="loading ? 'i-lucide-loader-circle' : icon || 'i-lucide-camera'"
            :class="['size-3', loading && 'animate-spin']"
          />
        </template>
      </UChip>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  src?: string
  alt?: string
  initials?: string
  avatarClass?: string
  icon?: string
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  buttonLabel?: string
  loading?: boolean
  disabled?: boolean
  // Parent-provided handler to process selected file (e.g., upload then update URL)
  update?: (file: File) => unknown
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
    await props.update?.(file)
  } finally {
    // Reset the input so selecting the same file still triggers a change.
    if (input) input.value = ''
  }
}
</script>

<style scoped>
.avatar-container {
  display: inline-flex;
  width: fit-content;
  margin-bottom: calc(var(--spacing) * 2);
}
.avatar-button {
  display: inline-flex;
  border-radius: 9999px;
  cursor: pointer;
}
.avatar-button:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
.avatar-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.avatar {
  width: 96px;
  height: 96px;
}
</style>
