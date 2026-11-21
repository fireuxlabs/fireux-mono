<template>
  <UContainer>
    <ClientOnly>
      <FireState v-if="!hasAuthState" outcome="pending" entity="account" />

      <FireAuthSystem v-else-if="!isAuthenticated" />
      <FireState
        v-else-if="userOutcome === 'error'"
        outcome="error"
        entity="account"
        :error="userError"
        retryable
        @retry="retryUserRead"
      />
      <UserCreateSystem v-else-if="userOutcome === 'empty'" />

      <template v-else-if="userOutcome === 'ready' && user">
        <div class="fx-card-body-stack">
          <header class="fx-card__header">
            <div class="fx-card__actions">
              <h2>Environment Check</h2>
              <UBadge
                :color="env?.isValid ? 'success' : 'warning'"
                variant="soft"
              >
                {{ env?.isValid ? 'ready' : 'pending' }}
              </UBadge>
            </div>
            <UButton size="xs" variant="soft" @click="onRefreshEnv"
              >Refresh</UButton
            >
          </header>

          <AppCreateOnboardingVariables
            :env-data="env"
            :pending="pending"
            :error="envError"
          />

          <div class="fx-card-body-stack">
            <UButton
              block
              size="lg"
              :loading="actionPending"
              :disabled="!canProceed || actionPending"
              @click="onProceed"
            >
              Initialize App
            </UButton>
            <p v-if="!env?.isValid && !canProceed">
              Fix required environment variables to enable this action.
            </p>
            <p v-if="proceedError">
              {{ proceedError }}
            </p>
          </div>
        </div>
      </template>
      <FireState v-else outcome="pending" entity="account" />

      <template #fallback>
        <FireState outcome="pending" entity="account" />
      </template>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import { useAppInitialization } from '../../composables/initialization/useAppInitialization'
import UserCreateSystem from '../../../user/components/Create/System.vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

const { hasAuthState, isAuthenticated } = useAuth()
const {
  user,
  userOutcome,
  userError,
  env,
  envError,
  pending,
  actionPending,
  canProceed,
  proceedError,
  onRefreshEnv,
  onProceed,
} = useAppInitialization()

function retryUserRead() {
  window.location.reload()
}
</script>
