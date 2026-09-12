<!-- FILE: packages/core/fireux-core/src/runtime/user/components/Edit/Core.vue -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: turn root identity fields into friendly, focused edit cards. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: add a focused public biography editor. -->
<template>
  <section aria-label="Edit profile">
    <ClientOnly>
      <UPageCard v-if="user" variant="subtle">
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
import { computed, ref } from 'vue'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { useToastify } from '../../../composables/ui/useToastify'
import { useUserFormattingAndValidation } from '../../composables/firestore/utils/validation/useUserFormatting'
import type { User } from '../../models/user.model'
import type { UserRead } from '../../composables/useUserRead'
import { useUserProfileUpdate } from '../../composables/useUserProfileUpdate'
import { USER_DISPLAY_NAME_MAX_LENGTH } from '../../utils/profile-validation'

const props = defineProps<{
  user: User | null
  outcome: UserRead['outcome']['value']
}>()

const toast = useToastify()
const user = computed(() => props.user)
const userUpdate = useUserProfileUpdate({ user })
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

const { DisplayName, Bio, Handle } = useUserFormattingAndValidation()

type Msg = { success: string; failure: string }
const withToast =
  <T,>(op: (v: T) => Promise<unknown>, m: Msg) =>
  async (value: T) => {
    try {
      await op(value)
      toast.success(m.success)
    } catch (error) {
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
async function handleAvatarUpload(file: File) {
  avatarUploading.value = true
  try {
    await userUpdate.avatar(file)
    toast.success('Avatar updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update avatar: ${msg}`)
  } finally {
    avatarUploading.value = false
  }
}
</script>
