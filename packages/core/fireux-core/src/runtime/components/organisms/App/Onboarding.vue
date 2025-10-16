<template>
  <UContainer>
    <div v-if="!isUnlocked">
      <!-- Treat undefined (loading) same as null: show auth immediately to avoid dead state -->
      <template v-if="coreUser == null">
        <OrganismsAuthSystem />
      </template>
      <template v-else>
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
    </div>

    <div v-else class="edit-component">
      <LogoBrand size="medium" class="logo-wrapper" />
      <OrganismsAppOnboardingVariables />

      <UButton v-if="envData?.isValid" block @click="createAppHandler"
        >Create App</UButton
      >
      <UButton v-else-if="envData === null" block disabled
        >Checking Environment...</UButton
      >
      <UButton v-else block disabled>Fix Environment Issues First</UButton>
    </div>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUser } from '../../../composables/firestore/user/useUser'
import { useApp } from '../../../composables/app/useApp'
const { user } = useUser()
const coreUser = computed(() => user.value?.core ?? null)
const { data: envData, error: envError } = await useFetch(
  '/api/app/env-check',
  {
    server: false, // Only fetch on client side
    default: () => null,
  }
)
const { factory } = useApp()
const { ensure, ensuring, lastError, lastEnsuredId } = factory
const ensureError = computed(() => lastError.value?.message ?? null)
const ensuredAppId = computed(() => lastEnsuredId.value ?? null)

const pin = ref([])
const isUnlocked = ref(false)

function checkPin() {
  if (pin.value.join('') === '1234') {
    isUnlocked.value = true
  } else {
    pin.value = []
  }
}

async function createAppHandler() {
  try {
    await ensure(coreUser.value)
  } catch (error) {
    // factory.lastError already captures the thrown error for UI display
  }
}
</script>
<style scoped>
.pin-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 10vh;
  margin-top: var(--space-6);
}

.pin-instruction {
  text-align: center;
  margin-bottom: var(--space-4);
  color: var(--text-secondary);
}

.edit-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
}

.logo-wrapper {
  margin-bottom: var(--space-4);
}

.setup-reminder {
  margin-top: var(--space-4);
  font-size: 0.95em;
  color: var(--text-secondary);
  text-align: center;
}

.copy-code {
  margin-top: var(--space-2);
  padding: var(--space-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  background: var(--ui-bg);
  color: var(--text-primary);
  font-family: monospace;
  width: auto;
  cursor: pointer;
}

.debug-panel {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: #222;
  color: #0f0;
  font-family: monospace;
  border: 1px solid #444;
  border-radius: var(--radius-s);
  width: 100%;
  overflow-x: auto;
}
</style>
