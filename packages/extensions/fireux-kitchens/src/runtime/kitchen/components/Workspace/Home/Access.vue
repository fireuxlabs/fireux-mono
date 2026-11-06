<template>
  <UCard>
    <div class="workspace-surface workspace-surface--compact">
      <div class="card__media">
        <UIcon name="i-lucide-key-round" class="shrink-0" />
        <div class="workspace-surface workspace-surface--compact">
          <h2>Kitchen access needed</h2>
          <p>
            You’re signed in{{ accountName ? ` as ${accountName}` : '' }}, but
            this account has no Kitchen connected in {{ appName }}.
          </p>
          <p>
            Connect a Kitchen you already manage. If the access review does not
            allow it, ask an app administrator for help. Access in another app
            does not automatically give access here.
          </p>
        </div>
      </div>
      <div class="fx-card__actions">
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
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'

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
