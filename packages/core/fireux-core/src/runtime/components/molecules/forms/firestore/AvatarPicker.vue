<!-- packages/core/fireux-core/src/runtime/components/molecules/user/AvatarPicker.vue -->
<template>
  <div class="avatar-container">
    <UAvatar
      :src="proxiedSrc"
      :alt="alt || 'Avatar'"
      :text="initials"
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
import { computed } from 'vue'
import { useImageStorage } from '../../../../composables/firebase/useImageStorage'

const emit = defineEmits<(e: 'uploaded', url: string) => void>()

const props = defineProps<{
  src?: string
  storagePath: string   // e.g. "core-users/{id}/avatar" or "apps/{appId}/chefs/{id}/avatar"
  alt?: string
  initials?: string
}>()

const { uploadImage } = useImageStorage()

const proxiedSrc = computed(() => {
  const url = props.src || ''
  if (!url) return ''
  return url.includes('googleusercontent.com') || url.includes('google.com/')
    ? `/api/proxy/image?url=${encodeURIComponent(url)}`
    : url
})

const initials = computed(() => props.initials || 'U')

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  try {
    const url = await uploadImage(props.storagePath, file)
    emit('uploaded', url)
  } catch (err) {
    console.error('[AvatarPicker] upload failed:', err)
  } finally {
    ;(e.target as HTMLInputElement).value = ''
  }
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
.avatar { width: 96px; height: 96px; }
.upload-label {
  position: absolute;
  bottom: -6px; right: -6px;
  display: grid; place-items: center;
  cursor: pointer;
  background-color: var(--ui-bg-muted);
  padding: 8px;
  border-radius: 9999px;
}
.file-input { display: none; }
</style>