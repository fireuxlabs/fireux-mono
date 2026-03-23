<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue -->
<template>
  <div class="w-full">
    <UCard class="w-full">
      <div class="space-y-4">
        <div class="flex w-full justify-center" aria-label="Brand wordmark">
          <AppBrandWordmark
            size="large"
            class="h-16 w-auto max-w-full object-contain"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
        </div>

        <template v-if="isAuthenticated">
          <div class="w-full space-y-4">
            <p class="font-medium">You're signed in.</p>
            <UserCardsPill
              v-if="currentUserPill"
              v-bind="currentUserPill"
              :link="Boolean(currentUserPill && currentUserPill.to)"
              :show-badges="false"
            />
            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="Account sync in progress"
              :description="`Signed in as ${authIdentityLabel}.`"
            />

            <div class="flex w-full flex-col gap-3">
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
          <UButton
            block
            color="neutral"
            variant="subtle"
            :loading="providerLoading"
            :disabled="providerLoading"
            icon="i-logos-google-icon"
            @click="handleGoogle"
          >
            Continue with Google
          </UButton>

          <USeparator label="or continue with email" />

          <AuthEmailPanel :brand-label="ecosystemLabel" />
        </template>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRoute, useRouter, watch } from '#imports'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const router = useRouter()
const route = useRoute()
const {
  authState,
  hasAuthState,
  signOutUser,
  signInWithGoogle,
  currentUser: authUser,
} = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)

const config = useFireUXConfig()
const ecosystemLabel = config.ecosystem

const { currentUser } = useUser()
const { interface } = useUserInterface()
const currentUserPill = computed(() =>
  currentUser.value ? interface(currentUser.value) : null
)
const authIdentityLabel = computed(() =>
  String(authUser.value?.displayName || authUser.value?.email || authUser.value?.uid || 'unknown')
)

function sanitizeRedirect(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  return trimmed
}

const postAuthPath = computed(
  () => sanitizeRedirect(route.query.redirect) ?? '/dashboard'
)

watch(
  () => [route.path, hasAuthState.value, isAuthenticated.value, postAuthPath.value] as const,
  async ([path, authReady, authenticated, target]) => {
    if (path !== '/auth') return
    if (!authReady || !authenticated) return
    await router.replace(target).catch(() => {})
  },
  { immediate: true }
)

const goToDashboard = async () => {
  await router.push(postAuthPath.value).catch(() => {})
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
  if (providerLoading.value) return
  providerLoading.value = true
  try {
    const user = await signInWithGoogle()
    if (user?.uid) {
      await router.push(postAuthPath.value).catch(() => {})
    }
  } finally {
    providerLoading.value = false
  }
}
</script>
