<template>
  <UCard class="max-w-2xl">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <UIcon
          name="i-lucide-key-round"
          class="mt-1 size-5 shrink-0 text-muted"
        />
        <div class="space-y-2">
          <h2 class="text-lg font-semibold">Kitchen access needed</h2>
          <p class="text-sm text-muted">
            You’re signed in{{ accountName ? ` as ${accountName}` : '' }}, but
            this account has no Kitchen connected in {{ appName }}.
          </p>
          <p class="text-sm text-muted">
            Connect a Kitchen you already manage. If the access review does not
            allow it, ask an app administrator for help. Access in another app
            does not automatically give access here.
          </p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          to="/workspace/kitchen/create"
          label="Connect existing Kitchen"
          icon="i-lucide-link"
        />
        <UButton
          label="Use another account"
          icon="i-lucide-user-round"
          color="neutral"
          variant="soft"
          :loading="switching"
          @click="switchAccount"
        />
        <UButton
          to="/"
          label="View customer site"
          color="neutral"
          variant="ghost"
        />
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'

defineProps<{ appName: string }>()
const { currentUser, signOutUser } = useAuth()
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const accountName = computed(() => currentUser.value?.displayName || '')
const switching = ref(false)
async function switchAccount() {
  switching.value = true
  try {
    await signOutUser(
      `/auth?redirect=${encodeURIComponent(workspaceEntryPath.value)}`
    )
  } finally {
    switching.value = false
  }
}
</script>
