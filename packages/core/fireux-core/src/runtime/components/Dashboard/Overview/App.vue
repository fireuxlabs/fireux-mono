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
      :label="`Join ${config.appName}`"
      :loading="joining"
      @click="join"
    />
    <p v-else-if="appUser">
      {{ roleLabels[appUser.role] }} · {{ planLabels[appUser.subscription] }}
    </p>
    <UAlert v-if="joinError" color="error" :title="joinError" />
    <div v-if="canManageApp" class="fx-card__actions">
      <UButton
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
import { useRoute } from '#imports'
import { computed, ref, watch } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAppUserRead } from '../../../app/composables/membership/useAppUserRead'
import { runAppUserCommand } from '../../../app/composables/membership/run-app-user-command'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'

const config = useFireUXConfig()
const route = useRoute()
const { uid } = useAuth()
const { appUser, outcome } = useAppUserRead(config.appId, uid)
const canManageApp = computed(
  () =>
    outcome.value === 'ready' &&
    (appUser.value?.role === 'admin' || appUser.value?.role === 'dev')
)
const roleLabels = { user: 'Member', admin: 'Administrator', dev: 'Developer' }
const planLabels = { free: 'Free', pro: 'Pro', business: 'Business' }
const joining = ref(false)
const joinError = ref('')
const joinScope = [() => uid.value, () => config.appId, () => route.fullPath]
const captureJoin = useCommandScope(joinScope)
watch(
  joinScope,
  () => {
    joining.value = false
    joinError.value = ''
  },
  { flush: 'sync' }
)

async function join() {
  if (!uid.value || joining.value || outcome.value !== 'empty') return
  const isCurrent = captureJoin()
  joining.value = true
  joinError.value = ''
  try {
    await runAppUserCommand({ action: 'ensure-self' }, undefined, isCurrent)
  } catch (error) {
    if (isCurrent())
      joinError.value =
        error instanceof Error ? error.message : 'Please try joining again.'
  } finally {
    if (isCurrent()) joining.value = false
  }
}

function reload() {
  window.location.reload()
}
</script>
