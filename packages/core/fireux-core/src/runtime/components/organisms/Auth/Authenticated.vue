<template>
  <div class="auth-authenticated">
    <UButton block @click="goDashboard">Go to Dashboard</UButton>
    <UButton block variant="ghost" @click="handleSignOut">Sign Out</UButton>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'

const router = useRouter()
const { signOutUser } = useAuth()

const goDashboard = () => {
  router.push('/dashboard').catch(() => {})
}

const handleSignOut = async () => {
  await signOutUser()
  await router.push('/auth').catch(() => {})
}
</script>

<style scoped>
.auth-authenticated {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
</style>
