<template>
  <div class="appuser-cta">
    <p v-if="appUser">✅ You are a member of this app.</p>
    <p v-else>❌ You are not yet a member of this app.</p>

    <div class="cta-buttons">
      <UButton v-if="!appUser" size="lg" color="primary" @click="() => ensureAppUser()">
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
const { appUser } = await useAppUser()
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
