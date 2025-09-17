<template>
  <UContainer class="widget center-content">
    <ClientOnly>
      <Transition name="fade">
        <div>
          <div v-if="authState === 'AUTHENTICATED'">
            <OrganismsAuthAuthenticated />
          </div>

          <div v-else class="auth-central">
            <!-- Tenant onboarding: sign-in with Misebox account only -->
            <div v-if="role === 'tenant'" class="tenant-onboarding">
              <p class="headline">
                <span class="emoji">👉</span>
                Sign in with your Misebox account to join
                <strong>{{ appName }}</strong
                >.
              </p>
              <OrganismsAuthGoogle />
              <OrganismsAuthEmail mode="sign-in" />
              <!-- Optional: We can add a static link later if needed -->
            </div>

            <!-- Ecosystem (Misebox root) shows both sign-in and sign-up affordances -->
            <div v-else>
              <OrganismsAuthGoogle />
              <OrganismsAuthEmail mode="auto" />
            </div>
          </div>
        </div>
      </Transition>
    </ClientOnly>
  </UContainer>
</template>

<script setup>
const { authState } = useAuth()
const { role, appName } = useFireUXConfig()
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
.tenant-onboarding {
  display: grid;
  gap: var(--space-4);
  text-align: center;
}
.headline {
  font-size: 1.1rem;
  margin-bottom: var(--space-2);
}
.headline .emoji {
  margin-right: 0.25rem;
}
.subtle {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
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
