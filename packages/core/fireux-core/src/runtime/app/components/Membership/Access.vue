<template>
  <FireState
    v-if="appUserOutcome === 'idle' || appUserOutcome === 'pending'"
    entity="app user"
    outcome="pending"
  />
  <FireState
    v-else-if="appUserOutcome === 'error'"
    entity="app user"
    outcome="error"
  />
  <UAlert
    v-else-if="appUserOutcome === 'empty' || !appUser"
    title="App user not found"
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
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
