<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue -->
<template>
  <section class="auth-card">
    <div class="auth-logo" aria-label="Brand wordmark">
      <AppBrandWordmark
        size="large"
        class="auth-logo__img"
        light-src="/img/app/wordmark-light.png"
        dark-src="/img/app/wordmark-dark.png"
      />
    </div>
    <template v-if="isAuthenticated">
      <div class="signed-in">
        <p class="status">You're signed in.</p>
        <OrganismsUserCardsPill
          v-if="currentUserPill"
          v-bind="currentUserPill"
          class="user-pill"
        />
        <div class="auth-actions">
          <UButton block color="primary" @click="goToDashboard">
            Go to dashboard
          </UButton>
          <UButton
            block
            variant="ghost"
            :loading="signOutLoading"
            @click="handleSignOut"
          >
            Sign out
          </UButton>
        </div>
      </div>
    </template>
    <template v-else>
      <button
        type="button"
        class="provider-button"
        :disabled="providerLoading"
        :aria-busy="providerLoading"
        aria-label="Continue with Google"
        @click="handleGoogle"
      >
        <img :src="googleLogo" alt="Continue with Google" />
        <span class="sr-only">Continue with Google</span>
      </button>
      <div class="divider">
        <span class="divider-line" />
        <span class="divider-label">or continue with email</span>
        <span class="divider-line" />
      </div>
      <OrganismsAuthEmailPanel :brand-label="ecosystemLabel" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useRouter } from '#imports'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useColorMode } from '../../../composables/fireux/app/useColorMode'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

const router = useRouter()
const { authState, signOutUser, signInWithGoogle, isReady } = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)

const config = useFireUXConfig()
const ecosystemLabel = config.ecosystem

const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')
const googleLogo = computed(() =>
  isDarkMode.value
    ? '/img/core/auth/sign-in-dark.svg'
    : '/img/core/auth/sign-in-light.svg'
)

const { currentUser, card } = useUser()
const currentUserPill = computed(() =>
  currentUser.value ? card(currentUser.value) : null
)

const goToDashboard = async () => {
  await router.push('/dashboard').catch(() => {})
}

const handleSignOut = async () => {
  if (signOutLoading.value) return
  signOutLoading.value = true
  try {
    await signOutUser('/auth')
  } finally {
    signOutLoading.value = false
  }
}

const handleGoogle = async () => {
  if (import.meta.dev) {
    const href = typeof window !== 'undefined' ? window.location.href : undefined
    // eslint-disable-next-line no-console
    console.log('[fireux][auth] google click', {
      providerLoading: providerLoading.value,
      isReady: isReady.value,
      authState: authState.value,
      href,
    })
  }
  if (providerLoading.value) return
  providerLoading.value = true
  try {
    const user = await signInWithGoogle()
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log('[fireux][auth] google result', {
        uid: user?.uid ?? null,
        hasUser: !!user,
      })
    }
    if (user?.uid) {
      await router.push('/dashboard').catch(() => {})
    }
  } finally {
    providerLoading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  background: var(--ui-bg, #fff);
  padding: 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 640px) {
  .auth-card {
    padding: 1.5rem;
    gap: 1.25rem;
  }
}

.auth-logo {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.auth-logo__img {
  height: clamp(56px, 12vw, 72px);
  width: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

.signed-in {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status {
  font-weight: 600;
}

.user-pill {
  margin: 0 auto;
}

.auth-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.provider-button {
  border: none;
  background: transparent;
  border-radius: 999px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.provider-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.divider {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.25rem 0 0.75rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--ui-text-muted, #94a3b8);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--ui-border-200, rgba(148, 163, 184, 0.5));
}

.divider-label {
  white-space: nowrap;
}
</style>
