<!-- FILE: packages/core/fireux-core/src/runtime/components/User/Edit/Core.vue -->
<template>
  <section class="space-y-2">
    <p class="text-xs font-semibold uppercase tracking-wide text-toned">
      Core Properties
    </p>

    <ClientOnly>
      <div v-if="user" class="space-y-6">
        <UCard>
          <div class="flex flex-col items-center gap-2">
            <MoleculesFormsFirestoreImagePicker
              :src="proxiedAvatarUrl"
              :alt="user.display_name || user.handle || 'User'"
              :initials="avatarInitials"
              :update-function="handleAvatarUpload"
            />
            <p v-if="avatarUploading" class="text-xs text-muted">
              Uploading avatar…
            </p>
          </div>
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Display Name"
            :firebase-value="user.display_name"
            placeholder="Display name"
            :maxlength="60"
            :update-function="handleUpdateDisplayName"
            :validation-function="DisplayName.validate"
            :formatting-function="DisplayName.format"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Handle"
            :firebase-value="user.handle"
            placeholder="your-handle"
            :update-function="handleUpdateHandle"
            :validation-function="Handle.validate"
            :formatting-function="Handle.format"
          />
        </UCard>

      </div>

      <MoleculesStateCard v-else entity="profile" kind="document" loading />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy'
import { useToastify } from '../../../composables/fireux/app/ui/useToastify'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useUserFormattingAndValidation } from '../../../composables/fireux/firestore/core/user/utils/validation/useUserFormatting'
import type { User } from '../../../models/core/user.model'

import type { UserRefs } from '../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUserUpdate } from '../../../composables/fireux/firestore/core/user/mutations/useUserUpdate'

const props = defineProps<{ user: User | null; userRefs?: UserRefs }>()

const toast = useToastify()
const userApi = useUser()
const resolvedRefs = (props.userRefs ?? (userApi as unknown as UserRefs))
const userUpdate = useUserUpdate(resolvedRefs, 'UserEditCore')
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

const { DisplayName, Handle } = useUserFormattingAndValidation()

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
    throw error
  } finally {
    avatarUploading.value = false
  }
}
</script>
