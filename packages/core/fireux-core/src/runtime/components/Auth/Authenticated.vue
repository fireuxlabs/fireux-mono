<template>
  <div class="auth-authenticated">
    <UButton block @click="goDashboard">Open workspace</UButton>
    <UButton block variant="ghost" @click="handleSignOut">Sign Out</UButton>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/fireux/firebase/useAuth'

const router = useRouter()
const { signOutUser } = useAuth()

const goDashboard = () => {
  router.push('/dashboard').catch(() => {})
}

const handleSignOut = async () => {
  await signOutUser('/auth')
}
</script>

<style scoped>
.auth-authenticated {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  width: 100%;
}
</style>
