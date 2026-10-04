<template>
  <UContainer class="mx-auto max-w-lg py-12"
    ><UCard
      ><div class="space-y-5">
        <h1 class="text-2xl font-semibold">Continue to Misebox</h1>
        <p v-if="pending" role="status">Checking your connected account…</p>
        <template v-else-if="connection?.connected"
          ><p>
            Sign into {{ connection.localLabel }} using
            {{
              currentUser?.email ||
              currentUser?.displayName ||
              'your FireUX account'
            }}.
          </p>
          <p class="text-sm text-muted">
            Your Misebox profile, permissions and subscription stay the same.
          </p>
          <UButton
            label="Continue to Misebox"
            :loading="busy"
            :disabled="busy"
            @click="continueToMisebox"
        /></template>
        <template v-else-if="connection"
          ><UAlert
            variant="subtle"
            color="info"
            title="Connect your Misebox account first"
            description="Connect an existing account to use shared sign-in." /><UButton
            :to="connectionsPath"
            label="Connect Misebox"
        /></template>
        <div v-if="error || readError" role="alert" class="space-y-2">
          <UAlert
            variant="subtle"
            color="error"
            title="Shared sign-in could not continue"
            :description="error || connectionFeedback(readError)"
          /><MoleculesCopyError
            :message="error || connectionFeedback(readError)"
          />
        </div>
        <UButton
          :to="connectionsPath"
          label="Back to connections"
          variant="ghost"
          color="neutral"
          :disabled="busy"
        /></div></UCard
  ></UContainer>
</template>
<script setup lang="ts">
import { resolveConnectionResume } from 'fireux-fireux/runtime/user/utils/connection-resume'
import {
  useAccountConnectionAction,
  connectionFeedback,
} from 'fireux-core/runtime/user/composables/connections/useAccountConnectionAction'
import { useUserConnections } from 'fireux-fireux/runtime/user/composables/connections/useUserConnections'
definePageMeta({ layout: 'auth', requiresAuth: true })
useHead({
  title: 'Continue to Misebox',
  meta: [
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
})
const route = useRoute()
const connectionsPath = computed(() => {
  const resume = resolveConnectionResume(route.fullPath)
  return resume
    ? `/dashboard/connections?resume=${encodeURIComponent(resume)}`
    : '/dashboard/connections'
})
const { run, busy, error, currentUser } = useAccountConnectionAction(
  '/api/account/connection'
)
const { connection, pending, error: readError } = useUserConnections()
async function continueToMisebox() {
  const result = await run<{ uid: string; destination: string }>({
    action: 'authorize',
    state: route.query.state,
    challenge: route.query.challenge,
    returnTo: route.query.redirect,
  })
  if (result) await navigateTo(result.destination, { external: true })
}
</script>
