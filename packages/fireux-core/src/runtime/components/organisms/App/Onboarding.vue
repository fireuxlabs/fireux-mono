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
      <FireLogoType size="medium" class="logo-wrapper" />
      <FireOrganismsAppOnboardingVariables />

      <UButton v-if="envData?.isValid" block @click="createAppHandler"
        >Create App</UButton
      >

      <p v-else class="setup-reminder">
        ⚠️ Some required environment variables are missing. Please set them
        before creating an app.<br />
        After updating your credentials, <strong>restart your server:</strong
        ><br />
        <input
          class="copy-code"
          readonly
          value="npm run dev"
          @click="event.target.select()"
        />
      </p>
    </div>
  </UContainer>
</template>

<script setup>
// Auto-import should work now
const { coreUser } = await useCoreUser()
const { pin, isUnlocked, checkPin, createAppHandler } = useApp()
const { data: envData } = await useFetch('/api/env-check')
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
