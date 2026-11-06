<template>
  <FireStateCard
    v-if="appUserOutcome === 'idle' || appUserOutcome === 'pending'"
    entity="app user"
    kind="document"
    loading
  />
  <FireStateCard
    v-else-if="appUserOutcome === 'error'"
    entity="app user"
    kind="document"
    state="error"
  />
  <FireStateCard
    v-else-if="appUserOutcome === 'empty' || !appUser"
    entity="app user"
    kind="document"
    state="empty"
  />
  <UPageCard
    v-else
    title="App User"
    icon="i-lucide-user-round-check"
    variant="subtle"
  >
    <dl class="divide-y divide-default">
      <div class="py-3 first:pt-0">
        <dt>Role</dt>
        <dd class="mt-1">
          {{ appUser.role }}
        </dd>
      </div>
      <div class="py-3">
        <dt>Subscription</dt>
        <dd class="mt-1">
          <UserAccessBadge :subscription="appUser.subscription" />
        </dd>
      </div>
    </dl>
  </UPageCard>
</template>
<script setup lang="ts">
import { useUserSession } from '../../../user/composables/session/useUserSession'
const { appUser, appOutcome: appUserOutcome } = useUserSession()
</script>
