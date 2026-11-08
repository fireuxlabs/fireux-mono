<template>
  <UPageCard title="Session" variant="subtle">
    <FireState
      v-if="!mounted || !hasAuthState"
      outcome="pending"
      entity="your session"
    />
    <template v-else-if="isAuthenticated">
      <p>Signed in as {{ currentUser?.email || 'your account' }}.</p>
      <div class="fx-card__actions">
        <UButton
          label="Sign out"
          icon="i-lucide-log-out"
          color="neutral"
          variant="soft"
          :loading="busy"
          :disabled="busy"
          @click="signOut"
        />
      </div>
    </template>
    <UButton
      v-else
      to="/auth?redirect=%2Fdashboard%2Fsettings"
      label="Sign in"
    />
  </UPageCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMounted } from '@vueuse/core'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

const { currentUser, hasAuthState, isAuthenticated, signOutUser } = useAuth()
const mounted = useMounted()
const busy = ref(false)
async function signOut() {
  if (busy.value) return
  busy.value = true
  try {
    await signOutUser('/')
  } finally {
    busy.value = false
  }
}
</script>
