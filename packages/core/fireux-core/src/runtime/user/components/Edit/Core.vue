<!-- FILE: packages/core/fireux-core/src/runtime/user/components/Edit/Core.vue -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: turn root identity fields into friendly, focused edit cards. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: add a focused public biography editor. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: require the route-owned active User refs for profile mutations. -->
<template>
  <section class="space-y-4" aria-labelledby="public-profile-fields">
    <div>
      <h2 id="public-profile-fields" class="text-lg font-semibold text-highlighted">
        Edit your profile
      </h2>
      <p class="mt-1 text-sm text-muted">
        Update one detail at a time. Each change saves as soon as you confirm it.
      </p>
    </div>

    <ClientOnly>
      <div v-if="user" class="space-y-4">
        <UPageCard
          title="Profile photo"
          description="Use a clear image people will recognise across your apps."
          icon="i-lucide-image"
          variant="subtle"
        >
          <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <MoleculesFormsFirestoreImagePicker
              :src="proxiedAvatarUrl"
              :alt="user.display_name || user.handle || 'User'"
              :initials="avatarInitials"
              button-label="Change profile photo"
              :loading="avatarUploading"
              :update-function="handleAvatarUpload"
            />

            <div class="min-w-0 flex-1 text-center sm:text-left">
              <p class="text-sm text-toned">
                Choose a square photo or image for the best crop.
              </p>
              <p
                v-if="avatarUploading"
                class="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary"
                role="status"
              >
                <UIcon name="i-lucide-loader-circle" class="size-3.5 animate-spin" />
                Uploading photo…
              </p>
              <p v-else class="mt-2 text-xs text-dimmed">
                Select the camera button on your photo to replace it.
              </p>
            </div>
          </div>
        </UPageCard>

        <UPageCard
          title="Name and handle"
          description="These are the public details shown on your User card."
          icon="i-lucide-id-card"
          variant="subtle"
        >
          <div class="space-y-5">
            <MoleculesFormsFirestoreSimpleField
              label="Display name"
              :firebase-value="user.display_name"
              placeholder="Display name"
              :maxlength="60"
              :update-function="handleUpdateDisplayName"
              :validation-function="DisplayName.validate"
              :formatting-function="DisplayName.format"
            />

            <USeparator />

            <MoleculesFormsFirestoreSimpleField
              label="Handle"
              :firebase-value="user.handle"
              placeholder="your-handle"
              :update-function="handleUpdateHandle"
              :validation-function="Handle.validate"
              :formatting-function="Handle.format"
            />

            <UAlert
              color="neutral"
              variant="soft"
              icon="i-lucide-at-sign"
              title="Your public address"
              :description="publicAddress"
            />
          </div>
        </UPageCard>

        <UPageCard
          title="About you"
          description="A short introduction for your User card and public profile."
          icon="i-lucide-align-left"
          variant="subtle"
        >
          <MoleculesFormsFirestoreSimpleField
            label="Bio"
            :firebase-value="user.bio"
            placeholder="Tell people what you build, do or care about."
            type="textarea"
            :rows="5"
            :maxlength="280"
            :update-function="handleUpdateBio"
            :validation-function="Bio.validate"
            :formatting-function="Bio.format"
          />
        </UPageCard>
      </div>

      <MoleculesStateCard v-else entity="profile" kind="document" loading />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy'
import { useToastify } from '../../../composables/fireux/app/ui/useToastify'
import { useUserFormattingAndValidation } from '../../composables/firestore/utils/validation/useUserFormatting'
import type { User } from '../../models/user.model.ts'

import type { UserRefs } from '../../composables/firestore/fetch/useUserFetch'
import { useUserUpdate } from '../../composables/firestore/mutations/useUserUpdate'

const props = defineProps<{ user: User | null; userRefs: UserRefs }>()

const toast = useToastify()
const userUpdate = useUserUpdate(props.userRefs, 'UserEditCore')
const coreProfile = userUpdate.core.profile

const user = computed(() => props.user)
const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(() => user.value?.avatar ?? '')
const avatarInitials = computed(() => {
  const name = user.value?.display_name || user.value?.handle || user.value?.id || 'U'
  const trimmed = name.trim()
  if (!trimmed) return 'U'
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})
const publicAddress = computed(() => {
  const handle = String(user.value?.handle || '').trim().replace(/^@+/, '')
  return handle
    ? `/users/${handle}`
    : 'Choose a handle to create a profile address people can share.'
})

const { DisplayName, Bio, Handle } = useUserFormattingAndValidation()

type Msg = { success: string; failure: string }
const withToast =
  <T>(op: (v: T) => Promise<unknown>, m: Msg) =>
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

const handleUpdateDisplayName = withToast(coreProfile.rename, {
  success: 'Display name updated',
  failure: 'Failed to update display name',
})

const handleUpdateBio = withToast(coreProfile.setBio, {
  success: 'Bio updated',
  failure: 'Failed to update bio',
})

const handleUpdateHandle = withToast(coreProfile.setHandle, {
  success: 'Handle updated',
  failure: 'Failed to update handle',
})

const avatarUploading = ref(false)
async function handleAvatarUpload(file: File) {
  avatarUploading.value = true
  try {
    await coreProfile.uploadAvatar(file)
    toast.success('Avatar updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update avatar: ${msg}`)
  } finally {
    avatarUploading.value = false
  }
}
</script>
