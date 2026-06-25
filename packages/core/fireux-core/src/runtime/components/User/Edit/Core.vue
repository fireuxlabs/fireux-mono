<!-- FILE: packages/core/fireux-core/src/runtime/components/User/Edit/Core.vue -->
<template>
  <section class="space-y-2">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">
      Core Properties
    </p>

    <ClientOnly>
      <div v-if="user" class="space-y-6">
        <UCard v-if="canManageAppMembership">
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs text-gray-600 space-y-1">
              <p>appUser.role: {{ appUserRole }}</p>
              <p>core adminOf: {{ user?.adminOf?.join(', ') || 'none' }}</p>
            </div>
            <USwitch
              :model-value="isAppAdmin"
              :loading="togglingAdmin"
              :disabled="isOnlyAdmin && isAppAdmin"
              label="Admin"
              @update:model-value="handleToggleAdmin"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex flex-col items-center gap-2">
            <MoleculesFormsFirestoreImagePicker
              :src="proxiedAvatarUrl"
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
import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy'
import { useToastify } from '../../../composables/fireux/app/ui/useToastify'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
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
const { app, setAppUserAdmin } = useApp()

const appAdmins = computed(() =>
  Array.isArray(app.value?.admin_ids)
    ? app.value?.admin_ids.filter(
        (id: unknown): id is string => typeof id === 'string' && id.length > 0
      )
    : []
)

const resolvedAppUser = computed(() =>
  props.userRefs?.appUser?.value ?? userApi.appUser?.value ?? null
)
const appUserRole = computed(() => resolvedAppUser.value?.role ?? 'user')
const isAppAdmin = computed(() => appUserRole.value === 'admin')
const canManageAppMembership = computed(() => userApi.isAdmin.value === true)
const isOnlyAdmin = computed(
  () => isAppAdmin.value && appAdmins.value.length <= 1
)
const togglingAdmin = ref(false)

const handleToggleAdmin = async (nextValue: boolean) => {
  if (!props.user?.id) return
  if (!canManageAppMembership.value) {
    toast.error('Only admins can update admin status')
    return
  }
  togglingAdmin.value = true
  try {
    console.log('1) toggle-start', {
      makeAdmin: nextValue,
      userId: props.user.id,
    })
    await setAppUserAdmin(props.user.id, nextValue)
    console.log('2) app-user-role-updated')
    console.log('3) app-admin-ids-updated', appAdmins.value)
    console.log('4) core-user-adminOf-updated', userApi.coreUser.value?.adminOf)
    toast.success(nextValue ? 'Granted admin' : 'Removed admin')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Admin update failed: ${msg}`)
    throw error
  } finally {
    togglingAdmin.value = false
  }
}

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

const handleUpdateHandle = withToast(coreProfile.setHandle, {
  success: 'Handle updated',
  failure: 'Failed to update handle',
})

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
