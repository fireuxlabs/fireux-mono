<template>
  <div v-if="!isLoaded">
    <MoleculesLoading />
  </div>
  <div v-else-if="hasAccess">
    <slot />
  </div>
  <div v-else class="access-denied-container">
    <UCard>
      <template #header>
        <UIcon
          name="i-heroicons-shield-exclamation"
          class="access-denied-icon"
        />
        <h3>Access Protected</h3>
      </template>
      <div class="access-content">
        <p class="access-message">
          {{ accessMessage }}
        </p>
        <div class="access-actions">
          <UButton
            v-if="!currentUser"
            to="/auth"
            color="primary"
            size="lg"
            block
          >
            Sign In to Continue
          </UButton>
          <div v-else-if="currentUser && !appUser" class="app-user-actions">
            <UButton
              @click="handleCreateAppUser"
              color="green"
              size="lg"
              block
              :loading="isCreatingAppUser"
            >
              Join {{ appName }}
            </UButton>
            <UButton to="/auth" variant="outline" size="sm" block class="mt-2">
              Sign In with Different Account
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
const { currentUser } = useAuth()
const { appUser, ensureAppUser } = useAppUser()
const { appName } = useFireUXConfig()

const isCreatingAppUser = ref(false)

const isLoaded = computed(() => {
  // Consider loaded when we have determined the auth state
  return currentUser.value !== undefined
})

const hasAccess = computed(() => {
  // User must be authenticated (not anonymous) AND have an app user record
  return currentUser.value && !currentUser.value.isAnonymous && appUser.value
})

const accessMessage = computed(() => {
  if (!currentUser.value) {
    return `Please sign in to access your ${appName} dashboard.`
  }
  if (currentUser.value.isAnonymous) {
    return `Anonymous access is not permitted. Please create an account to continue.`
  }
  if (!appUser.value) {
    return `Complete your ${appName} account setup to access the dashboard.`
  }
  return 'Access denied. Please contact support if this continues.'
})

const handleCreateAppUser = async () => {
  isCreatingAppUser.value = true
  try {
    await ensureAppUser()
    // The reactive appUser will update and hasAccess will become true
  } catch (error) {
    console.error('Failed to create app user:', error)
  } finally {
    isCreatingAppUser.value = false
  }
}
</script>

<style scoped>
.access-denied-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: var(--space-4);
}

.access-denied-icon {
  font-size: 2rem;
  color: var(--color-warning-500);
  margin-bottom: var(--space-2);
}

.access-content {
  text-align: center;
  padding: var(--space-4);
}

.access-message {
  font-size: 1.1rem;
  color: var(--color-gray-600);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.access-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.app-user-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mt-2 {
  margin-top: var(--space-2);
}
</style>
