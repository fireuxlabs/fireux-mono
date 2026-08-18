<template>
  <UContainer>
    <ClientOnly>
      <div
        v-if="!hasAuthState || (isAuthenticated && userPending)"
        class="flex min-h-64 flex-col items-center justify-center gap-3 py-8 text-center"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-7 animate-spin text-primary"
        />
        <p class="text-sm text-muted">Checking your account…</p>
      </div>

      <template v-else-if="!coreUser && !isAuthenticated">
        <AuthSystem />
      </template>
      <template v-else-if="!coreUser">
        <UserCreateSystem />
      </template>

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
              Initialize App
            </UButton>
            <p
              v-if="!env?.isValid && !canProceed"
              class="mt-2 text-xs text-muted"
            >
              Fix required environment variables to enable this action.
            </p>
            <p v-if="proceedError" class="mt-2 text-xs text-error">
              {{ proceedError }}
            </p>
          </div>
        </div>
      </template>

      <template #fallback>
        <div
          class="flex min-h-64 flex-col items-center justify-center gap-3 py-8 text-center"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-7 animate-spin text-primary"
          />
          <p class="text-sm text-muted">Checking your account…</p>
        </div>
      </template>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import type { AppInitializationState } from '../../composables/utils/useAppInitialization'
import { useAppInitialization } from '../../composables/utils/useAppInitialization'
import UserCreateSystem from '../../../user/components/Create/System.vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

const props = defineProps<{
  state?: AppInitializationState | null
}>()

const { hasAuthState, isAuthenticated } = useAuth()
const {
  coreUser,
  userPending,
  env,
  envError,
  pending,
  actionPending,
  canProceed,
  proceedError,
  onRefreshEnv,
  onProceed,
} = props.state ?? useAppInitialization()
</script>
