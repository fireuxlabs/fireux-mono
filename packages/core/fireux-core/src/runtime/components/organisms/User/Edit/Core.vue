<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Core.vue -->
<template>
  <section class="space-y-2">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">
      Core Properties
    </p>

    <ClientOnly>
      <div v-if="user" class="space-y-6">
        <UCard>
          <div class="flex flex-col items-center gap-2">
            <MoleculesFormsFirestoreAvatarPicker
              :src="user.avatar"
              :alt="user.display_name || user.handle || 'User'"
              :initials="avatarInitials"
              :update-function="handleAvatarUpload"
            />
            <p v-if="avatarUploading" class="text-xs text-gray-500">
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
            label="Email"
            type="email"
            :firebase-value="user.email"
            placeholder="user@example.com"
            :update-function="handleUpdateEmail"
            :validation-function="Email.validate"
            :formatting-function="Email.format"
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

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Bio"
            type="textarea"
            :rows="4"
            :maxlength="280"
            :firebase-value="user.bio"
            placeholder="A short bio about yourself..."
            :update-function="handleUpdateBio"
            :validation-function="Bio.validate"
            :formatting-function="Bio.format"
          />
        </UCard>
      </div>

      <MoleculesStateCard v-else entity="profile" kind="document" loading />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser.ts'
import { useToastify } from '../../../../composables/ui/useToastify.ts'
import { useUserFormattingAndValidation } from '../../../../composables/fireux/firestore/core/user/utils/forms/useUserFormatting.ts'

const props = defineProps<{ user: User | null }>()

const toast = useToastify()
const userApi = useUser()
const { pillProps } = userApi
const coreProfile = userApi.core.profile

const user = computed(() => props.user)
const avatarInitials = computed(
  () => pillProps(user.value ?? null).initials ?? 'A'
)

const { DisplayName, Handle, Email, Bio } = useUserFormattingAndValidation()

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

const handleUpdateEmail = async () => {
  toast.warn('Email updates are not available yet')
  throw new Error('updateEmail not available')
}

const handleUpdateHandle = async () => {
  toast.warn('Handle updates are not available yet')
  throw new Error('updateHandle not available')
}

const handleUpdateBio = withToast(coreProfile.setBio, {
  success: 'Bio updated',
  failure: 'Failed to update bio',
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
