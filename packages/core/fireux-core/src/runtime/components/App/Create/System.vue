<template>
  <UContainer>
    <!-- 1) Auth -->
    <template v-if="!coreUser">
      <AuthSystem />
    </template>

    <!-- 2) Env check + proceed -->
    <template v-else>
      <div class="space-y-6 py-6">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold">Environment Check</h2>
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
          :show-proceed="Boolean(env)"
          :proceed-pending="actionPending"
          :proceed-disabled="!canProceed || actionPending"
          @proceed="onProceed"
        />

        <div class="pt-2">
          <UButton
            block
            size="lg"
            :loading="actionPending"
            :disabled="!canProceed || actionPending"
            @click="onProceed"
          >
            Continue
          </UButton>
          <p
            v-if="!env?.isValid && !canProceed"
            class="mt-2 text-xs text-muted"
          >
            Fix required environment variables to enable this action.
          </p>
          <p v-else-if="bypassWarning" class="mt-2 text-xs text-warning">
            Continuing in dev mode without required environment variables.
          </p>
          <p v-if="proceedError" class="mt-2 text-xs text-error">
            {{ proceedError }}
          </p>
        </div>
      </div>
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import type { AppOnboardingState } from '../../../composables/fireux/app/utils/useAppOnboarding'
import { useAppOnboarding } from '../../../composables/fireux/app/utils/useAppOnboarding'

const props = defineProps<{
  state?: AppOnboardingState | null
}>()

const {
  coreUser,
  env,
  envError,
  pending,
  actionPending,
  canProceed,
  bypassWarning,
  proceedError,
  onRefreshEnv,
  onProceed,
} = props.state ?? useAppOnboarding()
</script>
