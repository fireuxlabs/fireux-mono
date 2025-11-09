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
          :length="4"
          type="number"
          placeholder="○"
          @complete="checkPin"
        />
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

        <OrganismsAppOnboardingVariables
          :env-data="env"
          :pending="pending"
          :error="envError"
        />

        <div class="pt-2">
          <UButton block size="lg" :disabled="!env?.isValid" @click="onProceed">
            Continue
          </UButton>
          <p v-if="!env?.isValid" class="mt-2 text-xs text-gray-500">
            Fix required environment variables to enable this action.
          </p>
        </div>
      </div>
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from '../../composables/firestore/core/user/useUser.ts'
import { useAppEnsure } from '../../composables/firestore/core/app/main/useAppEnsure.ts'
import type { EnvCheckResponse } from '../../types/app/onboarding.ts'
import { useEnvCheck } from '../../composables/firestore/core/app/utils/useEnvCheck.ts'

/** 1) Core user gate */
const { coreUser: coreUserRef, hasCoreProfile } = useUser()
const coreUser = computed(() => (hasCoreProfile.value ? coreUserRef.value : null))

/** 2) PIN gate */
const EXPECTED_PIN = '1234' as const
const EXPECTED_PIN_DIGITS = EXPECTED_PIN.split('').map(Number)
const DEV_PIN_AUTO_UNLOCK = true
const pin = ref<number[]>(DEV_PIN_AUTO_UNLOCK ? [...EXPECTED_PIN_DIGITS] : [])
const isUnlocked = ref(DEV_PIN_AUTO_UNLOCK)

const resetPin = () => {
  pin.value = DEV_PIN_AUTO_UNLOCK ? [...EXPECTED_PIN_DIGITS] : []
}

function checkPin() {
  if (pin.value.join('') === EXPECTED_PIN) {
    isUnlocked.value = true
  }
  resetPin()
}

/** 3) Env check */
const { data, pending, error, refresh: refreshEnv } = await useEnvCheck()

const env = computed(() => (data.value as EnvCheckResponse) ?? null)
const envError = computed(() => {
  if (!error.value) return null
  if (error.value instanceof Error) return error.value.message
  return String(error.value)
})

/** 4) Continue button → useAppEnsure */
const { ensureApp } = useAppEnsure()

function onRefreshEnv() {
  void refreshEnv()
}

async function onProceed() {
  if (!env.value?.isValid) return
  try {
    const ensured = await ensureApp()
    console.log('[proceed] ensureApp result', ensured)
  } catch (e) {
    console.error('[proceed] ensureApp failed', e)
  }
}
</script>
