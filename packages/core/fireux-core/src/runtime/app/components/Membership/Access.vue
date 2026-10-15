<template>
  <MoleculesStateCard
    v-if="appUserOutcome === 'idle' || appUserOutcome === 'pending'"
    entity="app user"
    kind="document"
    loading
  />
  <MoleculesStateCard
    v-else-if="appUserOutcome === 'error'"
    entity="app user"
    kind="document"
    state="error"
  />
  <MoleculesStateCard
    v-else-if="appUserOutcome === 'missing' || !appUser"
    entity="app user"
    kind="document"
    state="missing"
  />
  <UPageCard
    v-else
    title="App User"
    icon="i-lucide-user-round-check"
    variant="subtle"
  >
    <dl class="divide-y divide-default text-sm">
      <div class="py-3 first:pt-0">
        <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
          Role
        </dt>
        <dd class="mt-1 font-medium capitalize text-highlighted">
          {{ appUser.role }}
        </dd>
      </div>
      <div class="py-3">
        <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
          Subscription
        </dt>
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
