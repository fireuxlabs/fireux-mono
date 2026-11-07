<template>
  <UPageCard :title="config.appName" variant="subtle">
    <FireState
      v-if="outcome === 'idle' || outcome === 'pending'"
      outcome="pending"
      entity="App access"
    />
    <FireState
      v-else-if="outcome === 'error'"
      outcome="error"
      entity="App access"
      retryable
      @retry="reload"
    />
    <UButton
      v-else-if="outcome === 'empty'"
      to="/users/create?redirect=%2Fdashboard"
      label="Join App"
    />
    <p v-else-if="appUser">
      {{ roleLabels[appUser.role] }} · {{ planLabels[appUser.subscription] }}
    </p>
    <div class="fx-card__actions">
      <UButton
        v-if="hasWorkspaceEntry"
        :to="workspaceEntryHref"
        label="Open Workspace"
        icon="i-lucide-panels-top-left"
      />
      <UButton
        v-if="canManageApp"
        to="/dashboard/admin"
        label="Manage App"
        icon="i-lucide-shield-check"
        color="neutral"
        variant="soft"
      />
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAppUserRead } from '../../../app/composables/membership/useAppUserRead'
import { useWorkspaceEntryCta } from '../../../workspace/composables/useWorkspaceEntryCta'

const config = useFireUXConfig()
const { uid } = useAuth()
const { appUser, outcome } = useAppUserRead(config.appId, uid)
const { hasWorkspaceEntry, workspaceEntryHref } = useWorkspaceEntryCta()
const canManageApp = computed(
  () =>
    outcome.value === 'ready' &&
    (appUser.value?.role === 'admin' || appUser.value?.role === 'dev')
)
const roleLabels = { user: 'Member', admin: 'Administrator', dev: 'Developer' }
const planLabels = { free: 'Free', pro: 'Pro', business: 'Business' }
function reload() {
  window.location.reload()
}
</script>
