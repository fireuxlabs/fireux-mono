<template>
  <UContainer class="widget center-content">
    <ClientOnly>
      <Transition name="fade">
        <div>
          <OrganismsAuthAuthenticated
            v-if="authState === 'AUTHENTICATED'"
          />
          <button v-if="authState === 'AUTHENTICATED' && !coreUser">
            <UButton @click="handleEnsureCoreUser">Recreate Core User</UButton>
          </button>
          <div v-else class="auth-central">
            <OrganismsAuthGoogle />
            <OrganismsAuthEmail />
          </div>
        </div>
      </Transition>
    </ClientOnly>
  </UContainer>
</template>

<script setup>
const { authState } = useAuth()
const { coreUser, ensureCoreUser } = await useCoreUser()

async function handleEnsureCoreUser() {
  try {
    await ensureCoreUser()
    console.log('✅ Core User successfully recreated.')
  } catch (error) {
    console.error('❌ Failed to recreate Core User:', error)
  }
}
</script>

<style scoped>
.widget {
  padding: var(--space-12);
  border: 1px solid var(--ui-primary);
  border-radius: var(--radius-xl);
  background-color: var(--ui-bg);
}
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
.auth-central {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
