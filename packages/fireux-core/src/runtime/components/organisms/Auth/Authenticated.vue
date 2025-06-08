<template>
  <div v-if="coreUser !== undefined && appUser !== undefined" class="button-group">
    <UButton block @click="handleClick">
      {{ coreUser ? (appUser ? 'Go to Dashboard' : 'Create App User') : 'Create Core User' }}
    </UButton>
    <UButton block @click="handleSignOut">Sign Out</UButton>
  </div>
</template>

<script setup>
const router = useRouter()
const { coreUser, ensureCoreUser } = useCoreUser()
const { appUser, ensureAppUser } = useAppUser()
const { signOutUser } = useAuth()

const handleClick = async () => {
  if (!coreUser.value) {
    await ensureCoreUser()
  } else if (!appUser.value) {
    await ensureAppUser()
  } else {
    router.push('/dashboard')
  }
}

const handleSignOut = async () => {
  await signOutUser()
  router.push('/auth')
}
</script>

<style scoped>
.button-group {
  flex-direction: column;
  margin: 0;
}
</style>