<template>
  <UContainer>
    <div v-if="!isUnlocked">
      <template v-if="coreUser === undefined">
        <p>Loading user data...</p>
      </template>
      <template v-else-if="coreUser === null">
        <FireOrganismsAuthSystem />
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
      <FireLogoBrand size="medium" class="logo-wrapper" />
      <FireOrganismsAppOnboardingVariables />

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
const { coreUser } = await useCoreUser()
const { data: envData, error: envError } = await useFetch(
  '/api/app/env-check',
  {
    server: false, // Only fetch on client side
    default: () => null,
  }
)
const { ensureApp } = await useAppEnsure()

const pin = ref([])
const isUnlocked = ref(false)

// Debug logging
console.log('🚀 Onboarding component mounted', {
  coreUser: coreUser.value,
  isUnlocked: isUnlocked.value,
  envData: envData.value,
})

// Log any environment check errors
if (envError.value) {
  console.error('Environment check failed:', envError.value)
}

function checkPin() {
  console.log('PIN input complete:', pin.value)
  if (pin.value.join('') === '1234') {
    console.log('Correct PIN entered! Unlocking...')
    isUnlocked.value = true
  } else {
    console.log('Incorrect PIN. Please try again.')
  }
}

async function createAppHandler() {
  try {
    // Pass the coreUser object to avoid refetching it
    const appId = await ensureApp(coreUser.value)
    console.log(`App '${appId}' successfully created or already exists.`)
  } catch (error) {
    console.error('Error creating app:', error)
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
