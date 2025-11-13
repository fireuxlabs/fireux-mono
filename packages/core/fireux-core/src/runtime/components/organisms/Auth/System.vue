<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue -->
<template>
  <UContainer class="center-content">
    <ClientOnly>
      <Transition name="fade">
        <div v-if="authState === 'AUTHENTICATED'">
          <OrganismsAuthAuthenticated />
        </div>

        <div v-else>
          <section class="auth-shell">
            <UAuthForm
              class="auth-form"
              :title="title"
              :fields="fields"
              :submit="submitBtn"
              :loading="loading"
              @submit="onSubmit"
            >
              <template #leading>
                <img :src="appLogo" :alt="`${appName} logo`" class="app-logo" />
              </template>

              <template #providers>
                <UButton
                  block
                  variant="ghost"
                  :loading="providerLoading"
                  @click="handleGoogle"
                >
                  <img
                    :src="googleLogo"
                    alt="Continue with Google"
                    class="google-logo"
                  />
                </UButton>
              </template>

              <template #validation>
                <UAlert
                  v-if="error"
                  color="warning"
                  variant="subtle"
                  :title="error"
                />
              </template>

              <template #footer>
                <USwitch v-model="isSignUp" label="Create a new account" />
              </template>
            </UAuthForm>
          </section>
        </div>
      </Transition>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useFireUXConfig } from '../../../composables/FireUXConfig.ts'

const router = useRouter()
const {
  authState,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} = useAuth()
const { appName } = useFireUXConfig()

const isSignUp = ref(false)
const loading = ref(false)
const providerLoading = ref(false)
const error = ref<string | null>(null)

const title = computed(() =>
  isSignUp.value ? `Create your ${appName} account` : `Sign in to ${appName}`
)

const submitBtn = computed(() => ({
  label: isSignUp.value ? 'Create Account' : 'Continue',
  block: true,
}))

const fields = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true },
]

const appLogo = '/img/brand/wordmark.png'
const googleLogo = '/img/sign-in-light.svg'

const pushDashboard = async () => {
  await router.push('/dashboard').catch(() => {})
}

const handleGoogle = async () => {
  providerLoading.value = true
  error.value = null

  try {
    const result = await signInWithGoogle()
    providerLoading.value = false
    if (result?.uid) {
      await pushDashboard()
      return
    }
    error.value = 'Google sign-in failed.'
  } catch (err) {
    providerLoading.value = false
    error.value = err instanceof Error ? err.message : 'Google sign-in failed.'
  }
}

const onSubmit = async ({ data }: { data?: Record<string, unknown> }) => {
  const email = String(data?.email ?? '').trim()
  const password = String(data?.password ?? '')

  if (!email || !password) {
    error.value = 'Enter your email and password.'
    return
  }

  loading.value = true
  error.value = null

  try {
    const handler = isSignUp.value
      ? signUpWithEmailPassword
      : signInWithEmailPassword
    const result = await handler(email, password)
    loading.value = false

    if (result?.uid) {
      await pushDashboard()
      return
    }

    error.value = 'Authentication failed.'
  } catch (err) {
    loading.value = false
    error.value = err instanceof Error ? err.message : 'Authentication failed.'
  }
}
</script>

<style scoped>
.center-content {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-shell {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: var(--space-8, 2rem);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: var(--radius-xl, 1rem);
  background-color: var(--ui-bg, #fff);
  box-shadow: var(--shadow-sm, 0 10px 30px rgba(15, 23, 42, 0.1));
}

.auth-form {
  width: 100%;
}

.app-logo {
  height: 34px;
  width: auto;
  margin: 0 auto;
}

.google-logo {
  height: 28px;
  width: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
