<!-- packages/core/fireux-core/src/runtime/components/molecules/user/AvatarPicker.vue -->
<template>
  <div class="avatar-container">
    <UAvatar
      :src="proxiedSrc"
      :alt="alt || 'Avatar'"
      :text="computedInitials"
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
import { useCurrentUser } from 'vuefire'
import { useImageStorage } from '../../../../composables/firebase/useImageStorage'
import { useScopedUpdater } from '../../../../composables/firestore/scopedUpdater'
import { useFireUXConfig } from '../../../../composables/FireUXConfig'

// Events: keep 'selected' for backwards compat; add 'uploaded', 'updated', 'error'
interface AvatarPickerEmits {
  (e: 'selected', file: File): void
  (e: 'uploaded', url: string): void
  (e: 'updated', url: string): void
  (e: 'error', error: unknown): void
}
const emit = defineEmits<AvatarPickerEmits>()

const props = defineProps<{
  // Display
  src?: string
  alt?: string
  initials?: string
  // Destination: either provide storagePath OR (collection,id)
  storagePath?: string
  collection?: string // e.g., 'users', 'chefs'
  id?: string // defaults to signed-in user's uid when collection === 'users'
  field?: string // field name to update (default 'avatar')
  autoUpdate?: boolean // when true, updates Firestore doc with the new URL
}>()

const auth = useCurrentUser()
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant'
const { uploadImage } = useImageStorage()
const { update } = useScopedUpdater()

const proxiedSrc = computed(() => {
  const url = props.src || ''
  if (!url) return ''
  return url.includes('googleusercontent.com') || url.includes('google.com/')
    ? `/api/proxy/image?url=${encodeURIComponent(url)}`
    : url
})

const computedInitials = computed(() => props.initials || 'U')

function resolveUid(): string | null {
  if (props.id) return props.id
  return auth.value?.uid || null
}

function computeStoragePath(): string {
  if (props.storagePath) return props.storagePath
  const id = resolveUid()
  const field = (props.field || 'avatar').replace(/\/+$/, '')
  if (!props.collection || !id)
    throw new Error(
      '[AvatarPicker] collection and id (or signed-in user) are required to compute storagePath'
    )

  if (props.collection === 'users') {
    if (isTenant) {
      if (!appId)
        throw new Error('[AvatarPicker] missing appId for tenant users')
      return `apps/${appId}/users/${id}/${field}`
    }
    return `core-users/${id}/${field}`
  }
  // Generic tenant collection path
  if (!isTenant || !appId) {
    throw new Error(
      '[AvatarPicker] non-user collections require tenant context'
    )
  }
  return `apps/${appId}/${props.collection}/${id}/${field}`
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0]
  try {
    if (!file) return
    emit('selected', file)
    const basePath = computeStoragePath()
    // Compute extension from MIME type or filename (fallback to jpg)
    const mime = file.type || ''
    let fromMime = ''
    if (mime === 'image/jpeg') fromMime = 'jpg'
    else if (mime === 'image/png') fromMime = 'png'
    else if (mime === 'image/webp') fromMime = 'webp'
    else fromMime = (mime.split('/')[1] || '').toLowerCase()
    const fromName = (file.name?.split('.')?.pop() || '').toLowerCase()
    const ext = (fromMime || fromName || 'jpg').replace(/[^a-z0-9]/gi, '')
    const path = /\.[a-z0-9]+$/i.test(basePath)
      ? basePath
      : `${basePath}.${ext}`
    const url = await uploadImage(path, file)
    emit('uploaded', url)
    if (props.autoUpdate && (props.collection || props.storagePath)) {
      const field = props.field || 'avatar'
      // When collection is provided, use scoped updater. Otherwise just emit uploaded.
      if (props.collection) {
        await update(props.collection, { [field]: url })
        emit('updated', url)
      }
    }
  } catch (error) {
    console.error('[AvatarPicker] upload failed:', error)
    emit('error', error)
  } finally {
    ;(e.target as HTMLInputElement).value = '' // reset input
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
