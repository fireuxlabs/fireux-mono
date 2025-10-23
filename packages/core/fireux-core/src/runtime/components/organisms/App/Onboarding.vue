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
          <UButton size="xs" variant="soft" @click="refreshEnv">
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
import { useFetch } from 'nuxt/app'
import { useUser } from '../../../composables/firestore/core/user/useUser'
import { useAppEnsure } from '../../../composables/firestore/core/app/useAppEnsure'

type EnvVarEntry = { key: string; present: boolean; value?: string }
type AdminAuthStatus = {
  json: boolean
  splitKeys: {
    FIREBASE_PROJECT_ID: boolean
    FIREBASE_CLIENT_EMAIL: boolean
    FIREBASE_PRIVATE_KEY: boolean
  }
  configured: boolean
}
type BrandAssetCheck = {
  name: string
  path: string
  ok: boolean
  reason?: string
  width?: number
  height?: number
}
interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  optional?: EnvVarEntry[]
  server: { adminAuth: AdminAuthStatus; optional: EnvVarEntry[] }
  missingRequired: string[]
  summary: {
    required: string
    optionalClient: string
    optionalServer: string
    brandAssets?: string
  }
  warnings: string[]
  notes: string[]
  brandAssets: BrandAssetCheck[]
}

/** 1) Core user gate */
const { user } = useUser()
const coreUser = computed(() => user.value?.core ?? null)

/** 2) PIN gate */
const pin = ref<string[]>([])
const isUnlocked = ref(false)
function checkPin() {
  if (pin.value.join('') === '1234') isUnlocked.value = true
  pin.value = []
}

/** 3) Env check */
const {
  data,
  pending,
  error,
  refresh: refreshEnv,
} = await useFetch<EnvCheckResponse>('/api/app/env-check', {
  server: false,
  default: () =>
    ({
      isValid: false,
      required: [],
      optionalClient: [],
      optional: [],
      server: {
        adminAuth: {
          json: false,
          splitKeys: {
            FIREBASE_PROJECT_ID: false,
            FIREBASE_CLIENT_EMAIL: false,
            FIREBASE_PRIVATE_KEY: false,
          },
          configured: false,
        },
        optional: [],
      },
      missingRequired: [],
      summary: {
        required: '0/0',
        optionalClient: '0/0',
        optionalServer: '0/0',
        brandAssets: '0/0',
      },
      warnings: [],
      notes: [],
      brandAssets: [],
    } as EnvCheckResponse),
})

const env = computed(() => (data.value as EnvCheckResponse) ?? null)
const envError = computed(() => {
  if (!error.value) return null
  if (error.value instanceof Error) return error.value.message
  return String(error.value)
})

/** 4) Continue button → useAppEnsure */
const { ensureApp } = useAppEnsure()

async function onProceed() {
  if (!env.value?.isValid) return
  console.log('[proceed] env ok:', env.value.isValid)
  try {
    const ensured = await ensureApp()
    console.log('[proceed] ensureApp result', ensured)
  } catch (error) {
    console.error('[proceed] ensureApp failed', error)
  }
}
</script>
