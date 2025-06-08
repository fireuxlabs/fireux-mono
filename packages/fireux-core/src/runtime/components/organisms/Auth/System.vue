<template>
  <UContainer class="widget center-content">
    <ClientOnly>
      <Transition name="fade">
        <FireOrganismsAuthAuthenticated v-if="authState === 'AUTHENTICATED'" />
        <div v-else class="auth-central">
          <FireOrganismsAuthGoogle />
          <FireOrganismsAuthEmail />
        </div>
      </Transition>
    </ClientOnly>
  </UContainer>
</template>

<script setup>
const { authState } = useAuth()
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
