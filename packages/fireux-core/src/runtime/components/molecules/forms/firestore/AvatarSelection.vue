<template>
  <div class="avatar-container">
    <UAvatar
      :src="proxiedAvatarUrl"
      :alt="getUserDisplayName(props.user)"
      :text="getUserInitials(props.user)"
      class="avatar"
    />
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

// Accept user as prop
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

// Helper function to get user display name
const getUserDisplayName = (user) => {
  if (!user) return 'User'
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }
  return user.display_name || user.email || 'User'
}

// Helper function to get user initials from first/last name
const getUserInitials = (user) => {
  if (!user) return 'U'

  // Try to use first_name and last_name for better initials
  if (user.first_name || user.last_name) {
    const first = user.first_name?.charAt(0) || ''
    const last = user.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  // Fallback to display_name or email
  const name = user.display_name || user.email || 'User'
  return (
    name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  )
}

const currentUser = useCurrentUser()
const { appUser, updateAvatar } = await useAppUser()
const { uploadUserAvatar } = useMediaStorage()
const { getProxiedAvatarUrl } = useAvatarProxy()

// Use prop user if provided, otherwise fall back to appUser
const userToDisplay = computed(() => props.user || appUser.value)

// Use proxied avatar URL to bypass CORS issues with Google images
const proxiedAvatarUrl = computed(
  () => getProxiedAvatarUrl(userToDisplay.value?.avatar) || ''
)

async function handleFileChange(e) {
  const file = e.target?.files?.[0]
  const uid = currentUser.value?.uid

  if (!file || !uid) {
    console.warn('Missing file or UID for avatar upload')
    return
  }

  try {
    // Upload to storage
    const url = await uploadUserAvatar(file, uid)

    if (url) {
      // Update database with new URL
      await updateAvatar(url)
      console.log('Avatar updated successfully')
    }
  } catch (error) {
    console.error('Avatar upload failed:', error)
  }
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
