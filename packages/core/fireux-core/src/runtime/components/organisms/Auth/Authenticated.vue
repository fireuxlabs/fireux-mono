<template>
  <div class="auth-authenticated">
    <UButton block @click="goConsole">Go to Console</UButton>
    <UButton block variant="ghost" @click="handleSignOut">Sign Out</UButton>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

const router = useRouter()
const { signOutUser } = useAuth()

const goConsole = () => {
  router.push('/console').catch(() => {})
}

const handleSignOut = async () => {
  await signOutUser('/auth')
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
