<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue -->
<template>
  <section class="auth-state" :class="{ 'auth-state--dark': isDarkMode }">
    <div class="logo" aria-label="Ecosystem wordmark">
      <img :src="ecosystemWordmark" :alt="`${ecosystemLabel} wordmark`" />
    </div>
    <template v-if="isAuthenticated">
      <div class="signed-in-panel">
        <p class="status">You're signed in.</p>
        <OrganismsUserCardsPill
          v-if="currentUserPill"
          :user="currentUserPill"
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
        <span>or continue with email</span>
      </div>
      <OrganismsAuthEmailPanel :brand-label="ecosystemLabel" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useColorMode } from '#imports'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

const router = useRouter()
const { authState, signOutUser, signInWithGoogle, isReady, lastBindError } = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)

const config = useFireUXConfig()
const ecosystemLabel = config.ecosystem
const ecosystemWordmark = '/img/ecosystem/wordmark-light.svg'

const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')
const googleLogo = computed(() =>
  isDarkMode.value
    ? '/img/core/auth/sign-in-dark.svg'
    : '/img/core/auth/sign-in-light.svg'
)

const { currentUser, pillProps } = useUser()
const currentUserPill = computed(() =>
  currentUser.value ? pillProps(currentUser.value) : null
)

onMounted(() => {
  if (!import.meta.dev) return
  // eslint-disable-next-line no-console
  console.log('[fireux][auth] system mounted', {
    isReady: isReady.value,
    authState: authState.value,
    hasBindError: !!lastBindError.value,
  })
  if (lastBindError.value) {
    // eslint-disable-next-line no-console
    console.warn('[fireux][auth] vuefire bind error', lastBindError.value)
  }
})

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
.auth-state {
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  background: var(--ui-bg, #fff);
}

.logo {
  margin: 0 auto 0.75rem;
  display: inline-block;
}

.logo img {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.signed-in-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.status {
  font-weight: 600;
}

.user-pill {
  margin: 0 auto;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-state--dark {
  color: #e2e8f0;
}

.provider-button {
  border: none;
  background: transparent;
  border-radius: 999px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.provider-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.divider {
  margin: 1.25rem 0 0.75rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.5);
}

.divider span {
  white-space: nowrap;
}
</style>
