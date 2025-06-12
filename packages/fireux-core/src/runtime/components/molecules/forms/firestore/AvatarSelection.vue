<template>
  <div class="avatar-container">
    <UAvatar :src="proxiedAvatarUrl" alt="User Avatar" class="avatar" />
    <label class="upload-label">
      <UIcon name="i-lucide-camera" />
      <input
        type="file"
        accept="image/*"
        class="file-input"
        @change="handleFileChange"
      />
    </label>
  </div>
</template>

<script setup>
import { useAvatarProxy } from '../../../../composables/utils/useAvatarProxy'

const currentUser = useCurrentUser()
const { appUser, updateUser } = useAppUser()
const { uploadUserAvatar } = useMediaStorage()
const { getProxiedAvatarUrl } = useAvatarProxy()

// Use proxied avatar URL to bypass CORS issues with Google images
const proxiedAvatarUrl = computed(
  () => getProxiedAvatarUrl(appUser.value?.avatar) || ''
)

async function handleFileChange(e) {
  const file = e.target?.files?.[0]
  const uid = currentUser.value?.uid
  if (!file || !uid) return

  const url = await uploadUserAvatar(file, uid)
  if (url) await updateUser({ avatar: url })
}
</script>

<style lang="scss">
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
}

.avatar {
  width: 80px;
  height: 80px;
}

.upload-label {
  position: absolute;
  top: calc(50% + 40px);
  left: calc(50% + 40px);
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--ui-bg-muted);
  padding: var(--space-2);
  border-radius: 50%;
}

.file-input {
  display: none;
}

@media (min-width: 768px) {
  .avatar {
    width: 120px;
    height: 120px;
  }
}
</style>
