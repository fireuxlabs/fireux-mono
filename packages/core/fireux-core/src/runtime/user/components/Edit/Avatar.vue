<template>
  <div class="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
    <p class="text-sm font-medium text-highlighted">Avatar</p>
    <FireFormsEditableImagePicker
      :src="proxiedAvatarUrl"
      :alt="user.display_name || user.handle || 'Your avatar'"
      :initials="avatarInitials"
      button-label="Change avatar"
      :loading="avatarUploading"
      :update="handleAvatarUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { useToastify } from '../../../composables/ui/useToastify'
import { useUserProfileUpdate } from '../../composables/identity/useUserProfileUpdate'
import type { User } from '../../models/user.model'

const props = defineProps<{ user: User }>()
const user = computed(() => props.user)
const userUpdate = useUserProfileUpdate({ user })
const { currentUser } = useAuth()
const config = useFireUXConfig()
const toast = useToastify()
const completionSources = [
  () => user.value.id,
  () => currentUser.value?.uid,
  () => config.appId,
]
const captureCompletion = useCommandScope(completionSources)
const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(() => user.value.avatar || '')
const avatarInitials = computed(
  () =>
    (user.value.display_name || user.value.handle || 'U')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
)
const avatarUploading = ref(false)
watch(
  completionSources,
  () => {
    avatarUploading.value = false
  },
  { flush: 'sync' }
)

async function handleAvatarUpload(file: File) {
  const isCurrent = captureCompletion()
  avatarUploading.value = true
  try {
    await userUpdate.avatar(file)
    if (isCurrent()) toast.success('Avatar updated')
  } catch (error) {
    if (!isCurrent()) return
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update avatar: ${message}`)
  } finally {
    if (isCurrent()) avatarUploading.value = false
  }
}
</script>
