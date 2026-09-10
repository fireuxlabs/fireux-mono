<template>
  <UCard variant="subtle">
    <template #header>
      <div class="space-y-3">
        <p class="text-sm font-semibold text-highlighted">
          Binding check (app ↔ users)
        </p>
        <p class="text-xs text-muted">
          Compares the current App memberships against projected public
          identities. Membership is authoritative in
          <span class="font-mono">/apps/{appId}/users</span>.
        </p>
      </div>
    </template>

    <div class="space-y-3 text-sm">
      <div class="text-xs text-muted">
        <span class="font-mono">scope</span>: {{ bindingAppId || 'unknown' }} ·
        <span class="font-mono">app users</span>: {{ bindingAppUsersCount }} ·
        <span class="font-mono">admins</span>: {{ bindingAdminIdsCount }}
      </div>

      <div v-if="isPending" class="text-xs text-muted">Checking…</div>

      <div v-else-if="bindingError" class="text-sm text-warning">
        Binding check unavailable. App admin access is required.
      </div>

      <div v-else>
        <div v-if="truncated" class="mb-3 text-sm text-warning">
          The bounded check reached its result limit.
        </div>

        <div v-if="!bindingTotal" class="text-sm text-success">
          No binding issues detected.
        </div>

        <div v-else-if="binding.missingCore.length" class="space-y-1">
          <div class="text-sm font-medium">
            App users missing public identity
          </div>
          <div class="text-xs text-muted">
            {{ binding.missingCore.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: constrain binding diagnostics to the bounded current-App admin API.
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAppUsers } from '../../app/composables/useAppUsers'
import type { App } from '../../app/models/app.model.ts'

defineProps<{ app?: App | null; apps?: App[] | null }>()

const { appId: bindingAppId } = useFireUXConfig()
const {
  memberships,
  pending: isPending,
  error: bindingError,
  truncated,
} = useAppUsers()

const binding = computed(() => ({
  missingCore: memberships.value.filter(membership => !membership.user).map(membership => membership.id),
}))
const bindingAppUsersCount = computed(() => memberships.value.length)
const bindingAdminIdsCount = computed(
  () =>
    memberships.value.filter(
      (membership) => membership.role === 'admin' || membership.role === 'dev'
    ).length
)
const bindingTotal = computed(() => binding.value.missingCore.length)
</script>
