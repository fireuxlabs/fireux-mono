<template>
  <div class="auth-authenticated">
    <!-- App-level CTA: renders Core/App user cards appropriately -->
    <OrganismsAppCTA />

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
const { coreUser, ensureCoreUser } = useCoreUser()
const { appTenancy } = useApp()
const isTenant = computed(() => {
  const role = (appTenancy.value || '').toLowerCase()
  return role === 'tennant' || role === 'tenant'
})
// Only use app user flows for tenant apps
let appUser, ensureAppUser
if (isTenant.value) {
  const au = useAppUser()
  appUser = au.appUser
  ensureAppUser = au.ensureAppUser
} else {
  appUser = null
}
const { signOutUser } = useAuth()

const buttonLabel = computed(() => {
  if (!coreUser.value) return 'Create Core User'
  if (isTenant.value && !appUser?.value) {
    return 'Create App User'
  }
  return 'Go to Dashboard'
})

const handleClick = async () => {
  if (!coreUser.value) {
    await ensureCoreUser()
  } else if (isTenant.value && !appUser?.value) {
    await ensureAppUser?.()
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
