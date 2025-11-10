<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Onboarding.vue -->
<template>
  <UContainer>
    <!-- 1) Auth -->
    <template v-if="!coreUser">
      <OrganismsAuthSystem />
    </template>

    <!-- 2) PIN -->
    <template v-else-if="!isUnlocked">
      <div class="flex min-h-[30vh] flex-col items-center justify-center gap-4">
        <p class="text-sm text-gray-500">
          🔒 Enter the developer PIN to continue.
        </p>
        <UPinInput
          v-model="pin"
          :length="pinLength"
          type="number"
          placeholder="○"
          @complete="checkPin"
        />
        <p v-if="pinError" class="text-xs text-red-500">{{ pinError }}</p>
      </div>
    </template>

    <!-- 3) Env check + proceed -->
    <template v-else>
      <div class="space-y-6 py-6">
        <header class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold">Environment Check</h2>
            <UBadge
              :color="env?.isValid ? 'success' : 'warning'"
              variant="soft"
            >
              {{ env?.isValid ? 'ready' : 'pending' }}
            </UBadge>
          </div>
          <UButton size="xs" variant="soft" @click="onRefreshEnv">
            Refresh
          </UButton>
        </header>

        <AppOnboardingVariables
          :env-data="env"
          :pending="pending"
          :error="envError"
        />

        <div class="pt-2">
          <UButton block size="lg" :disabled="!canProceed" @click="onProceed">
            Continue
          </UButton>
          <p
            v-if="!env?.isValid && !canProceed"
            class="mt-2 text-xs text-gray-500"
          >
            Fix required environment variables to enable this action.
          </p>
          <p v-else-if="bypassWarning" class="mt-2 text-xs text-amber-500">
            Continuing in dev mode without required environment variables.
          </p>
        </div>
      </div>
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import { useAppOnboarding } from '../../composables/app/useAppOnboarding.ts'

const {
  coreUser,
  isUnlocked,
  pin,
  pinError,
  pinLength,
  env,
  envError,
  pending,
  canProceed,
  bypassWarning,
  checkPin,
  onRefreshEnv,
  onProceed,
} = useAppOnboarding()
</script>
