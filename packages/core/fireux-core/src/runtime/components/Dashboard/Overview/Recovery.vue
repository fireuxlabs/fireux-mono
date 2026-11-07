<template>
  <UPageCard v-if="outcome === 'error'" variant="subtle">
    <FireState
      outcome="error"
      entity="your public profile"
      retryable
      @retry="reload"
    />
    <p>Your sign-in works, but your profile could not be loaded.</p>
    <div class="fx-card__actions">
      <UButton
        to="/users/create?redirect=%2Fdashboard"
        label="Review profile setup"
      />
      <UButton
        to="/auth?redirect=%2Fdashboard"
        label="Sign in again"
        color="neutral"
        variant="soft"
      />
    </div>
    <DevOnly>
      <FireDiagnosticsDebugPanel
        title="Profile read"
        :objects="{ error }"
        :derived="{}"
      />
    </DevOnly>
  </UPageCard>
  <UAlert
    v-else
    color="warning"
    variant="subtle"
    title="Set up your profile"
    description="Your sign-in is ready. Create your public profile to continue."
  >
    <template #actions>
      <UButton to="/users/create?redirect=%2Fdashboard" label="Continue" />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps<{ outcome: 'error' | 'empty'; error?: unknown }>()

function reload() {
  window.location.reload()
}
</script>
