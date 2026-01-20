<!-- packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/ImagePicker.vue -->
<template>
  <div class="avatar-container">
    <UAvatar
      :src="src || ''"
      :alt="alt || 'Image'"
      :text="initials || 'I'"
      class="avatar"
    />
    <label class="upload-label">
      <UIcon name="i-lucide-camera" />
      <input
        type="file"
        accept="image/*"
        class="file-input"
        @change="onFileChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
  initials?: string
  // Parent-provided handler to process selected file (e.g., upload then update URL)
  updateFunction?: (file: File) => unknown
}>()

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  if (props.updateFunction) props.updateFunction(file)
  // reset input so same file can be picked again if desired
  if (input) input.value = ''
}
</script>

<style scoped>
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
}
.avatar {
  width: 96px;
  height: 96px;
}
.upload-label {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: grid;
  place-items: center;
  cursor: pointer;
  background-color: var(--ui-bg-muted);
  padding: 8px;
  border-radius: 9999px;
}
.file-input {
  display: none;
}
</style>
