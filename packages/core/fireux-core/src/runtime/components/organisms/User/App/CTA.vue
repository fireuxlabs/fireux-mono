<template>
  <div class="appuser-cta">
    <p v-if="appUser">✅ You’re a member of {{ appName }}.</p>
    <p v-else>❌ Not yet a member of {{ appName }}.</p>

    <div class="cta-buttons">
      <UButton
        v-if="!appUser"
        size="lg"
        color="primary"
        @click="() => ensureAppUser()"
      >
        Join {{ appName }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'
import { useAppUserEnsure } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUserEnsure'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'

const { appName } = useFireUXConfig()
const { appUser } = useAppUser()
const { ensureAppUser } = useAppUserEnsure()
</script>

<style scoped>
.appuser-cta {
  display: grid;
  gap: 0.75rem;
}
.cta-buttons {
  margin-top: 0.5rem;
}
</style>
