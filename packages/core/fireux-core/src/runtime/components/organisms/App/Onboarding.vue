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
            <UBadge :color="env.isValid ? 'green' : 'orange'" variant="soft">
              {{ env.isValid ? 'ready' : 'pending' }}
            </UBadge>
          </div>
          <UButton size="xs" variant="soft" @click="refreshEnv"
            >Refresh</UButton
          >
        </header>

        <!-- Overall status -->
        <UAlert
          :color="env.isValid ? 'green' : 'orange'"
          :title="
            env.isValid
              ? 'All required variables are present.'
              : 'Missing required variables.'
          "
          :description="envSummaryText"
        />

        <!-- Quick summary chips -->
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="env.isValid ? 'green' : 'orange'" variant="soft">
            Required: {{ env.summary.required }}
          </UBadge>
          <UBadge color="gray" variant="soft">
            Optional (client): {{ env.summary.optionalClient }}
          </UBadge>
          <UBadge color="gray" variant="soft">
            Optional (server): {{ env.summary.optionalServer }}
          </UBadge>
          <UBadge
            :color="env.server.adminAuth.configured ? 'green' : 'orange'"
            variant="soft"
          >
            Admin SDK:
            {{
              env.server.adminAuth.configured ? 'configured' : 'not configured'
            }}
          </UBadge>
        </div>

        <!-- Required keys -->
        <UCard v-if="env.required.length">
          <template #header>
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Required variables</h3>
              <UBadge :color="env.isValid ? 'green' : 'orange'" variant="soft">
                {{ env.summary.required }}
              </UBadge>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="r in env.required"
              :key="r.key"
              :color="r.present ? 'green' : 'red'"
              :variant="r.present ? 'soft' : 'subtle'"
            >
              <span class="font-mono">{{ r.key }}</span>
            </UBadge>
          </div>
        </UCard>

        <!-- Optional (client) -->
        <UCard v-if="env.optionalClient.length">
          <template #header>
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Optional (client)</h3>
              <UBadge color="gray" variant="soft">
                {{ env.summary.optionalClient }}
              </UBadge>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="o in env.optionalClient"
              :key="o.key"
              :variant="o.present ? 'soft' : 'outline'"
            >
              <span class="font-mono">{{ o.key }}</span>
            </UBadge>
          </div>
        </UCard>

        <!-- Optional (server) -->
        <UCard v-if="env.server.optional.length">
          <template #header>
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Optional (server)</h3>
              <UBadge color="gray" variant="soft">
                {{ env.summary.optionalServer }}
              </UBadge>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="o in env.server.optional"
              :key="o.key"
              :variant="o.present ? 'soft' : 'outline'"
            >
              <span class="font-mono">{{ o.key }}</span>
            </UBadge>
          </div>
        </UCard>

        <!-- Warnings / Notes accordion -->
        <UAccordion
          v-if="env.warnings.length || env.notes.length"
          variant="soft"
          size="sm"
        >
          <UAccordionItem
            v-if="env.warnings.length"
            value="warnings"
            title="Warnings"
          >
            <ul class="mt-2 list-disc pl-5 text-sm">
              <li v-for="(w, i) in env.warnings" :key="i">{{ w }}</li>
            </ul>
          </UAccordionItem>
          <UAccordionItem v-if="env.notes.length" value="notes" title="Notes">
            <ul class="mt-2 list-disc pl-5 text-sm">
              <li v-for="(n, i) in env.notes" :key="i">{{ n }}</li>
            </ul>
          </UAccordionItem>
        </UAccordion>

        <!-- Continue -->
        <div class="pt-2">
          <UButton block size="lg" :disabled="!env.isValid" @click="onProceed">
            Continue
          </UButton>
          <p v-if="!env.isValid" class="mt-2 text-xs text-gray-500">
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
interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  server: { adminAuth: AdminAuthStatus; optional: EnvVarEntry[] }
  missingRequired: string[]
  summary: { required: string; optionalClient: string; optionalServer: string }
  warnings: string[]
  notes: string[]
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
const { data, refresh: refreshEnv } = await useFetch<EnvCheckResponse>(
  '/api/app/env-check',
  {
    server: false,
    default: () =>
      ({
        isValid: false,
        required: [],
        optionalClient: [],
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
        },
        warnings: [],
        notes: [],
      } as EnvCheckResponse),
  }
)

const env = computed(() => data.value as EnvCheckResponse)
const envSummaryText = computed(() => {
  if (env.value.isValid) return 'Ready.'
  const miss = env.value.missingRequired
  return miss.length ? `Missing: ${miss.join(', ')}` : 'Pending.'
})

/** 4) Continue button → useAppEnsure */
const { ensureApp } = useAppEnsure()

async function onProceed() {
  if (!env.value.isValid) return
  console.log('[proceed] env ok:', env.value.isValid)
  try {
    const ensured = await ensureApp()
    console.log('[proceed] ensureApp result', ensured)
  } catch (error) {
    console.error('[proceed] ensureApp failed', error)
  }
}
</script>
