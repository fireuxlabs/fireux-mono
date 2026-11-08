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
    <dl class="fx-card__detail-grid">
      <div>
        <dt>Role</dt>
        <dd>
          {{ appUser.role }}
        </dd>
      </div>
      <div>
        <dt>Subscription</dt>
        <dd>
          <UserAccessBadge :subscription="appUser.subscription" />
        </dd>
      </div>
    </dl>
  </UPageCard>
</template>
<script setup lang="ts">
import { useUserSession } from '../../../user/composables/session/useUserSession'
const { appUser, appUserOutcome } = useUserSession()
</script>
