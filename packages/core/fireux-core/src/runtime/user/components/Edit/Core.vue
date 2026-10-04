<!-- FILE: packages/core/fireux-core/src/runtime/user/components/Edit/Core.vue -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: turn root identity fields into friendly, focused edit cards. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: add a focused public biography editor. -->
<template>
  <section aria-label="Edit profile">
    <ClientOnly>
      <UPageCard v-if="user" :key="user.id" variant="subtle">
        <div class="space-y-6 sm:space-y-8">
          <div
            class="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center"
          >
            <p class="text-sm font-medium text-highlighted">Avatar</p>
            <MoleculesFormsEditableImagePicker
              :src="proxiedAvatarUrl"
              :alt="user.display_name || user.handle || 'User'"
              :initials="avatarInitials"
              button-label="Change avatar"
              :loading="avatarUploading"
              :update="handleAvatarUpload"
            />
          </div>

          <USeparator />

          <div class="grid gap-6 sm:grid-cols-2">
            <MoleculesFormsEditableSimpleField
              :capture-intent="captureCompletion"
              label="Display name"
              :value="user.display_name"
              placeholder="Display name"
              :maxlength="USER_DISPLAY_NAME_MAX_LENGTH"
              :update="handleUpdateDisplayName"
              :validation-function="DisplayName.validate"
              :formatting-function="DisplayName.format"
            />

            <div>
              <MoleculesFormsEditableSimpleField
                :capture-intent="captureCompletion"
                label="Handle"
                :value="user.handle"
                placeholder="your-handle"
                :update="handleUpdateHandle"
                :validation-function="Handle.validate"
                :formatting-function="Handle.format"
              />
              <p class="mt-2 font-mono text-xs text-dimmed">
                {{ profileAddress }}
              </p>
            </div>
          </div>

          <USeparator />

          <MoleculesFormsEditableSimpleField
            :capture-intent="captureCompletion"
            label="Bio"
            :value="user.bio"
            placeholder="Bio"
            type="textarea"
            :rows="5"
            :maxlength="280"
            :update="handleUpdateBio"
            :validation-function="Bio.validate"
            :formatting-function="Bio.format"
          />

          <USeparator />

          <div
            class="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center"
          >
            <p class="text-sm font-medium text-highlighted">User ID</p>
            <UInput :model-value="user.id" disabled class="w-full font-mono" />
          </div>
        </div>
      </UPageCard>

      <MoleculesStateCard
        v-else
        entity="User"
        kind="document"
        :loading="outcome === 'pending' || outcome === 'idle'"
        :state="outcome === 'error' ? 'error' : 'missing'"
      />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { useToastify } from '../../../composables/ui/useToastify'
import { USER_DISPLAY_NAME_FIELD as DisplayName, USER_BIO_FIELD as Bio, USER_HANDLE_FIELD as Handle } from '../../utils/user-formatting'
import type { User } from '../../models/user.model'
import type { UserRead } from '../../composables/useUserRead'
import { useUserProfileUpdate } from '../../composables/identity/useUserProfileUpdate'
import { USER_DISPLAY_NAME_MAX_LENGTH } from '../../utils/profile-validation'

const props = defineProps<{
  user: User | null
  outcome: UserRead['outcome']['value']
}>()

const toast = useToastify()
const user = computed(() => props.user)
const userUpdate = useUserProfileUpdate({ user })
const { currentUser } = useAuth()
const config = useFireUXConfig()
const completionSources = [
  () => user.value?.id,
  () => currentUser.value?.uid,
  () => config.appId,
]
const captureCompletion = useCommandScope(completionSources)
const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(() => user.value?.avatar ?? '')
const avatarInitials = computed(() => {
  const name =
    user.value?.display_name || user.value?.handle || user.value?.id || 'U'
  const trimmed = name.trim()
  if (!trimmed) return 'U'
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})
const profileAddress = computed(() => {
  const handle = String(user.value?.handle || '')
    .trim()
    .replace(/^@+/, '')
  return handle
    ? `/users/${handle}`
    : 'Choose a handle to create a profile address people can share.'
})


type Msg = { success: string; failure: string }
const withToast =
  <T,>(op: (v: T) => Promise<unknown>, m: Msg) =>
  async (value: T, isSurfaceCurrent: () => boolean = () => true) => {
    const isCurrent = captureCompletion()
    try {
      await op(value)
      if (!isCurrent() || !isSurfaceCurrent()) return
      toast.success(m.success)
    } catch (error) {
      if (!isCurrent() || !isSurfaceCurrent()) return
      const msg = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`${m.failure}: ${msg}`)
      throw error
    }
  }

const handleUpdateDisplayName = withToast(userUpdate.name, {
  success: 'Display name updated',
  failure: 'Failed to update display name',
})

const handleUpdateBio = withToast(userUpdate.bio, {
  success: 'Bio updated',
  failure: 'Failed to update bio',
})

const handleUpdateHandle = withToast(userUpdate.handle, {
  success: 'Handle updated',
  failure: 'Failed to update handle',
})

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
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update avatar: ${msg}`)
  } finally {
    if (isCurrent()) avatarUploading.value = false
  }
}
</script>
