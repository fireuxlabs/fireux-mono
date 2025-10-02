<template>
  <ClientOnly>
    <div class="space-y-8">
      <!-- Section: Both (shared fields) -->
      <UCard class="space-y-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Profile — Both</h3>
            <UBadge variant="soft">Shared fields</UBadge>
          </div>
        </template>

        <MoleculesFormsFirestoreAvatarPicker
          :src="avatar"
          :alt="displayName || 'User'"
          :update-function="onSaveAvatarBoth"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Display Name"
          :firebase-value="displayName"
          placeholder="Enter your display name"
          :update-function="onSaveDisplayNameBoth"
          :validation-function="validateDisplayName"
          :formatting-function="formatDisplayName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Handle"
          :firebase-value="handle"
          placeholder="your-handle"
          :update-function="onSaveHandleBoth"
          :validation-function="validateHandle"
          :formatting-function="formatHandle"
        />
      </UCard>

      <!-- Section: Local (app only) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Local (App)</h3>
            <UBadge variant="soft">Coming soon</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">No local-only fields yet.</p>
      </UCard>

      <!-- Section: Global (core only) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Global (Core)</h3>
            <UBadge variant="soft">Coming soon</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">No global-only fields yet.</p>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const {
  // display
  avatar, displayName, handle,
  // updates (now accept scope: 'auto' | 'core' | 'app')
  updateDisplayName, updateAvatar, updateHandle,
  // helpers
  validateDisplayName, formatDisplayName, validateHandle, formatHandle,
} = useUser()

const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant' && !!appId
const toast = useToast()

/** Shared/Both: write to local (auto) and offer to mirror to core when in a tenant app */
const onSaveDisplayNameBoth = async (v: string) => {
  try {
    await updateDisplayName(v, 'auto') // local first (app in tenant, core otherwise)
    if (isTenant) {
      toast.add({
        title: 'Display name updated in this app',
        description: 'Do you also want to update it globally?',
        actions: [
          {
            label: 'Update global',
            click: async () => {
              await updateDisplayName(v, 'core')
              toast.add({ title: 'Global updated', description: 'Display name mirrored to global' })
            }
          },
        ],
      })
    } else {
      toast.add({ title: 'Display name updated' })
    }
  } catch (err) {
    toast.add({ title: 'Error', description: 'Failed to update display name', color: 'red' })
    throw err
  }
}

const onSaveHandleBoth = async (v: string) => {
  try {
    await updateHandle(v, 'auto')
    if (isTenant) {
      toast.add({
        title: 'Handle updated in this app',
        description: 'Also update it globally?',
        actions: [
          {
            label: 'Update global',
            click: async () => {
              await updateHandle(v, 'core')
              toast.add({ title: 'Global updated', description: 'Handle mirrored to global' })
            }
          },
        ],
      })
    } else {
      toast.add({ title: 'Handle updated' })
    }
  } catch (err) {
    toast.add({ title: 'Error', description: 'Failed to update handle', color: 'red' })
    throw err
  }
}

const onSaveAvatarBoth = async (file: File) => {
  try {
    await updateAvatar(file, 'auto')
    if (isTenant) {
      toast.add({
        title: 'Avatar updated in this app',
        description: 'Also update it globally?',
        actions: [
          {
            label: 'Update global',
            click: async () => {
              await updateAvatar(file, 'core')
              toast.add({ title: 'Global updated', description: 'Avatar mirrored to global' })
            }
          },
        ],
      })
    } else {
      toast.add({ title: 'Avatar updated' })
    }
  } catch (err) {
    toast.add({ title: 'Error', description: 'Failed to update avatar', color: 'red' })
    throw err
  }
}
</script>

<!-- layout handled by parent; no local styles -->