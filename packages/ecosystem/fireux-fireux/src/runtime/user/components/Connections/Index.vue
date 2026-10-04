<template>
  <div class="mx-auto w-full max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Connected ecosystems</h1>
      <p class="mt-2 text-muted">
        Use FireUX to sign into your existing accounts. Each ecosystem keeps its
        own profile and access.
      </p>
    </div>
    <UCard>
      <div v-if="pending" role="status" class="flex items-center gap-2">
        <UIcon name="i-lucide-loader-circle" class="animate-spin" />Checking
        connections…
      </div>
      <div v-else-if="readError" class="space-y-3">
        <UAlert
          variant="subtle"
          color="warning"
          title="Connections are unavailable"
          description="Your usual account sign-ins still work. Try again shortly."
        /><MoleculesCopyError :message="connectionFeedback(readError)" />
      </div>
      <div v-else-if="connection" class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold">Misebox</h2>
            <p class="text-sm text-muted">Your food operation workspace</p>
          </div>
          <UBadge
            :color="connection.connected ? 'success' : 'neutral'"
            :label="connection.connected ? 'Connected' : 'Not connected'"
          />
        </div>
        <template v-if="connection.connected">
          <UButton v-if="resume" :to="resume" label="Continue to Misebox" />
          <p class="text-sm">Connected as {{ connection.localLabel }}</p>
          <div class="flex flex-wrap gap-3">
            <UButton
              :to="`${connection.miseboxOrigin}/account/fireux/start`"
              external
              label="Open Misebox"
              icon="i-lucide-arrow-up-right"
            /><UButton
              color="neutral"
              variant="ghost"
              label="Disconnect"
              :disabled="busy"
              @click="choice = 'disconnect'"
            />
          </div>
        </template>
        <template v-else
          ><p class="text-sm">
            Already use Misebox? Connect that account to keep all your existing
            work.
          </p>
          <UButton
            label="Connect Misebox"
            :disabled="busy"
            @click="choice = 'connect'"
        /></template>
        <Confirm
          v-if="choice"
          :key="choice"
          :title="
            choice === 'connect'
              ? 'Confirm your FireUX account'
              : 'Disconnect Misebox?'
          "
          :button-label="choice === 'connect' ? 'Continue' : 'Disconnect'"
          :description="
            choice === 'connect'
              ? 'Next, sign into Misebox and confirm the account you want to connect.'
              : 'Future sign-in with FireUX will stop. Your Misebox account and existing sessions remain.'
          "
          cancelable
          @cancel="choice = null"
          @confirmed="confirmed"
        />
      </div>
    </UCard>
    <div v-if="error" role="alert" class="space-y-2">
      <UAlert
        variant="subtle"
        color="error"
        title="Connection could not be updated"
        :description="error"
      /><MoleculesCopyError :message="error" />
    </div>
    <p v-if="removed" role="status" class="text-sm text-success">
      Misebox disconnected. You can still use your usual Misebox sign-in.
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { navigateTo } from '#imports'
import Confirm from 'fireux-core/runtime/user/components/Connections/Confirm.vue'
import {
  useAccountConnectionAction,
  connectionFeedback,
  type ConfirmedAccount,
} from 'fireux-core/runtime/user/composables/connections/useAccountConnectionAction'
import { useUserConnections } from '../../composables/connections/useUserConnections'
const props = defineProps<{ resume?: string }>()
const { connection, pending, error: readError } = useUserConnections()
const { run, busy, error, currentUser } = useAccountConnectionAction(
  '/api/account/connection'
)
const choice = ref<'connect' | 'disconnect' | null>(null)
const removed = ref(false)
watch(
  () => currentUser.value?.uid,
  () => {
    choice.value = null
    removed.value = false
  },
  { flush: 'sync' }
)
async function confirmed(account: ConfirmedAccount) {
  const action = choice.value
  if (!action) return
  const result = await run<{ uid: string; destination?: string; ok?: true }>(
    {
      action: action === 'connect' ? 'begin' : 'disconnect',
      resume: props.resume,
    },
    account
  )
  if (!result) return
  if (result.destination)
    await navigateTo(result.destination, { external: true })
  else {
    choice.value = null
    removed.value = true
  }
}
</script>
