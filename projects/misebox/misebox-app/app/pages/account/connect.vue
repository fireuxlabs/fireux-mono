<template>
  <UContainer class="mx-auto max-w-lg py-12"
    ><UCard
      ><div class="space-y-5">
        <h1 class="text-2xl font-semibold">Connect Misebox to FireUX</h1>
        <p v-if="pending" role="status">Checking your connection…</p>
        <template v-else-if="data"
          ><p>Connect your Misebox account to {{ data.hubLabel }} on FireUX.</p>
          <p class="text-sm text-muted">
            Your existing profile, Kitchens and permissions stay here.
          </p>
          <Confirm
            title="Confirm your Misebox account"
            button-label="Connect account"
            @confirmed="confirm" /><UButton
            variant="ghost"
            color="neutral"
            label="Use another Misebox account"
            :disabled="busy"
            @click="changeAccount"
        /></template>
        <div v-if="readError || error" role="alert" class="space-y-2">
          <UAlert
            variant="subtle"
            color="error"
            title="Connection could not continue"
            :description="error || connectionFeedback(readError)"
          /><MoleculesCopyError
            :message="error || connectionFeedback(readError)"
          />
        </div>
        <UButton
          :to="cancelPath"
          label="Cancel"
          variant="ghost"
          color="neutral"
          :disabled="busy"
        /></div></UCard
  ></UContainer>
</template>
<script setup lang="ts">
import {
  resolveInternalRedirect,
  resolvePostAuthDestination,
} from 'fireux-core/runtime/utils/onboarding-route'
import Confirm from 'fireux-core/runtime/user/components/Connections/Confirm.vue'
import {
  useAccountConnectionAction,
  connectionFeedback,
  type ConfirmedAccount,
} from 'fireux-core/runtime/user/composables/connections/useAccountConnectionAction'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
definePageMeta({ layout: 'auth', requiresAuth: true })
useHead({
  title: 'Connect to FireUX',
  meta: [
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
})
const route = useRoute()
const cancelPath = computed(() => {
  const resume = resolveInternalRedirect(route.query.resume, '')
  if (!resume) return '/dashboard'
  const continuation = new URL(resume, 'http://fireux.local')
  return continuation.pathname === '/account/continue'
    ? resolvePostAuthDestination(continuation.searchParams.get('redirect'))
    : '/dashboard'
})
const { run, busy, error } = useAccountConnectionAction('/api/account/fireux')
const {
  data,
  pending,
  error: readError,
} = useAsyncData(
  () => `connect:${route.query.request}`,
  () =>
    $fetch<{ hubLabel: string }>('/api/account/fireux', {
      query: { request: route.query.request },
    }),
  { server: false }
)
async function confirm(account: ConfirmedAccount) {
  const result = await run<{ uid: string; destination: string }>(
    {
      action: 'prove',
      request: route.query.request,
      resume: route.query.resume,
    },
    account
  )
  if (result) await navigateTo(result.destination, { external: true })
}
const { signOutUser } = useAuth()
async function changeAccount() {
  const destination = `/auth?redirect=${encodeURIComponent(route.fullPath)}`
  await signOutUser(destination)
}
</script>
