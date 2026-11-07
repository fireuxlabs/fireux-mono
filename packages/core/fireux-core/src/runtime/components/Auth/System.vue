<template>
  <UCard>
    <div class="fx-card-body-stack">
      <FireAuthBrand />
      <FireState
        v-if="authPhase === 'loading'"
        outcome="pending"
        entity="account"
      />
      <FireAuthContinue v-else-if="authPhase === 'signed-in'" />
      <FireAuthSignIn v-else />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useAuthPhase } from '../../composables/fireux/firebase/useAuthPhase'
const { authPhase } = useAuthPhase()
</script>
