<template>
  <div class="auth-authenticated">
    <div class="button-group">
      <UButton block @click="handleClick">
        {{ buttonLabel }}
      </UButton>
      <UButton block @click="handleSignOut">Sign Out</UButton>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const { signOutUser } = useAuth()
const { ensureUser } = useUserEnsure()
const { role } = useFireUXConfig()
const isTenant = computed(() => role === 'tenant')
const { user } = useUser()

const buttonLabel = computed(() => {
  const hasCore = !!user.value?.core
  const hasApp = !!user.value?.app
  if (!hasCore) return 'Create Core User'
  if (isTenant.value && !hasApp) return 'Join App'
  return 'Go to Dashboard'
})

const handleClick = async () => {
  // Ensure user first; redirect happens inside ensureUser when requested
  await ensureUser()
}

const handleSignOut = async () => {
  await signOutUser()
  router.push('/auth')
}
</script>

<style scoped>
.auth-authenticated {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.button-group {
  flex-direction: column;
  margin: 0;
}
</style>
