<template>
  <div class="coreuser-cta">
    <p v-if="authUser?.uid">✅ You have a CoreUser identity.</p>
    <p v-else>❌ You don’t have a CoreUser identity yet.</p>

    <div class="cta-buttons">
      <UButton
        v-if="!authUser?.uid"
        size="lg"
        color="primary"
        @click="onSignIn"
      >
        Create CoreUser
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentUser } from 'vuefire'

const authUser = useCurrentUser()

function onSignIn() {
  // Redirect or open sign-in flow
  navigateTo('/auth/signin')
}
</script>

<style scoped>
.coreuser-cta {
  display: grid;
  gap: 0.75rem;
}
.cta-buttons {
  margin-top: 0.5rem;
}
</style>
