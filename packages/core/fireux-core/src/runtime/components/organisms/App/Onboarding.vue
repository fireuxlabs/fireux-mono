<template>
  <UContainer>
    <template v-if="coreUser == null">
      <OrganismsAuthSystem />
    </template>

    <template v-else-if="!isUnlocked">
      <div class="pin-section">
        <p class="pin-instruction">🔒 Enter the developer PIN to continue.</p>
        <UPinInput
          v-model="pin"
          :length="4"
          type="number"
          placeholder="○"
          @complete="checkPin"
        />
      </div>
    </template>

    <template v-else>
      <div class="debug-root">
        <header class="debug-header">
          <h2>App Onboarding</h2>
          <div class="debug-actions">
            <UButton size="xs" variant="soft" @click="refreshEnv"
              >Refresh Env</UButton
            >
            <UButton size="xs" variant="soft" @click="refreshFactory"
              >Refresh Factory</UButton
            >
          </div>
        </header>

        <section class="debug-section">
          <header>
            <h3>Core User</h3>
          </header>
          <pre class="code-block">{{ prettyJson(coreUser) }}</pre>
        </section>

        <section class="debug-section">
          <header>
            <h3>Environment Check</h3>
            <span v-if="envData?.isValid" class="meta success">ready</span>
            <span v-else class="meta warning">pending</span>
          </header>
          <p v-if="envErrorMessage" class="error-text">
            Env error: {{ envErrorMessage }}
          </p>
          <pre class="code-block">{{ prettyJson(envData) }}</pre>
        </section>

        <section class="debug-section">
          <header>
            <h3>App Factory</h3>
            <span v-if="factoryPreview?.sandboxAllowed" class="meta"
              >sandbox enabled</span
            >
          </header>
          <p v-if="factoryError" class="error-text">
            Factory error: {{ factoryError }}
          </p>
          <pre class="code-block">{{ prettyJson(factoryPreview) }}</pre>
        </section>

        <section class="debug-section">
          <header>
            <h3>App Document</h3>
            <span
              class="meta"
              :class="isAppProvisioned ? 'success' : 'warning'"
            >
              {{ isAppProvisioned ? 'exists' : 'missing' }}
            </span>
          </header>
          <pre class="code-block">{{ prettyJson(appDoc) }}</pre>
        </section>

        <section class="action-panel">
          <UButton
            block
            :loading="ensuring"
            :disabled="ensureDisabled"
            @click="createAppHandler"
          >
            {{ ensureButtonLabel }}
          </UButton>
          <p v-if="ensureError" class="error-text">{{ ensureError }}</p>
          <pre v-if="ensureResult" class="code-block"
            >{{ prettyJson(ensureResult) }}
          </pre>
        </section>
      </div>
    </template>
  </UContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUser } from '../../../composables/firestore/user/useUser'
import { useApp } from '../../../composables/app/useApp'
import { useFirestoreManager } from '../../../composables/firestore/useFirestoreManager'

const { user } = useUser()
const coreUser = computed(() => user.value?.core ?? null)

const pin = ref([])
const isUnlocked = ref(false)

const {
  data: envData,
  error: envError,
  refresh: refreshEnv,
} = await useFetch('/api/app/env-check', {
  server: false,
  default: () => null,
})

const envErrorMessage = computed(() => {
  const value = envError.value
  if (!value) return null
  if (value instanceof Error) return value.message
  return typeof value === 'string' ? value : JSON.stringify(value)
})

const { app, factory } = useApp()
const { createApp, canCreateSandbox } = factory
const appDoc = computed(() => app.value ?? null)
const isAppProvisioned = computed(() => Boolean(appDoc.value))

const { setDocument } = useFirestoreManager()

const factoryPreview = ref(null)
const factoryError = ref(null)
const ensureResult = ref(null)
const ensureError = ref(null)
const ensuring = ref(false)

function checkPin() {
  if (pin.value.join('') === '1234') {
    isUnlocked.value = true
    pin.value = []
  } else {
    pin.value = []
  }
}

function refreshFactory() {
  factoryError.value = null
  try {
    const sandboxAllowed = canCreateSandbox()
    const defaultPayload = createApp()
    const sandboxPayload = sandboxAllowed
      ? createApp(['sandbox', 'Debug Sandbox'])
      : null

    factoryPreview.value = {
      sandboxAllowed,
      defaultPayload,
      ...(sandboxPayload ? { sandboxPayload } : {}),
    }
  } catch (error) {
    factoryError.value = error instanceof Error ? error.message : String(error)
    factoryPreview.value = null
  }
}

watch(
  () => isUnlocked.value,
  (value) => {
    if (value) refreshFactory()
  }
)

watch(
  () => appDoc.value,
  () => {
    if (isUnlocked.value) refreshFactory()
  }
)

const ensureDisabled = computed(() => {
  if (ensuring.value) return true
  if (!envData.value?.isValid) return true
  if (!coreUser.value?.id) return true
  return isAppProvisioned.value
})

const ensureButtonLabel = computed(() => {
  if (isAppProvisioned.value) return 'App Already Initialised'
  if (!envData.value?.isValid) return 'Environment Not Ready'
  return ensuring.value ? 'Initialising…' : 'Initialise App'
})

async function createAppHandler() {
  if (ensureDisabled.value) return
  ensuring.value = true
  ensureError.value = null
  ensureResult.value = null

  try {
    const userId = coreUser.value?.id
    if (!userId) throw new Error('Missing core user id.')

    if (isAppProvisioned.value && appDoc.value?.id) {
      ensureResult.value = {
        status: 'already-initialised',
        id: appDoc.value.id,
      }
      return
    }

    const blueprint = createApp()
    if (!blueprint?.id) throw new Error('Factory did not provide an app id.')

    const adminIds = Array.from(
      new Set([
        userId,
        ...(Array.isArray(blueprint.admin_ids) ? blueprint.admin_ids : []),
      ])
    )

    const payload = {
      ...blueprint,
      admin_ids: adminIds,
      is_active: true,
    }

    await setDocument('apps', blueprint.id, payload)

    ensureResult.value = {
      status: 'created',
      id: blueprint.id,
      payload,
    }

    await refreshEnv()
  } catch (error) {
    ensureError.value = error instanceof Error ? error.message : String(error)
  } finally {
    ensuring.value = false
  }
}

function prettyJson(source) {
  try {
    return JSON.stringify(source ?? null, null, 2)
  } catch (error) {
    console.warn('Unable to stringify debug payload.', error)
    return '[unserializable]'
  }
}
</script>

<style scoped>
.pin-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 30vh;
  gap: var(--space-4);
}

.pin-instruction {
  text-align: center;
  color: var(--text-secondary);
}

.debug-root {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) 0;
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.debug-actions {
  display: flex;
  gap: var(--space-3);
}

.debug-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.debug-section header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.meta {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.meta.success {
  color: var(--green-600);
}

.meta.warning {
  color: var(--orange-600);
}

.code-block {
  background: var(--ui-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-text {
  color: var(--red-600);
  font-size: 0.875rem;
}

.action-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
