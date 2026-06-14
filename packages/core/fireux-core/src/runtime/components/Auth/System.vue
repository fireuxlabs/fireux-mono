<!-- FILE: packages/core/fireux-core/src/runtime/components/Auth/System.vue -->
<template>
  <div class="w-full">
    <UCard class="w-full">
      <div class="space-y-4">
        <div class="flex w-full justify-center" aria-label="Brand wordmark">
          <AppBrandWordmark
            v-if="!isTenantApp"
            size="large"
            class="h-16 w-auto max-w-full object-contain"
          />
          <AppBrandWordmark
            v-else
            size="medium"
            :light-src="ecosystemWordmarkLight"
            :dark-src="ecosystemWordmarkDark"
            :alt="ecosystemBrandAlt"
            class="h-10 w-auto max-w-40 object-contain"
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
                {{ authenticatedPrimaryLabel }}
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

          <UButton
            v-if="allowAnonymousAuth"
            block
            color="neutral"
            variant="ghost"
            :loading="anonymousLoading"
            :disabled="providerLoading || anonymousLoading"
            icon="i-lucide-user-round"
            @click="handleAnonymous"
          >
            Continue as guest
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
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const router = useRouter()
const route = useRoute()
const {
  authState,
  hasAuthState,
  signOutUser,
  signInWithGoogle,
  signInAnonymous,
  currentUser: authUser,
  creating: creatingUser,
} = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)
const anonymousLoading = ref(false)

const config = useFireUXConfig()
const ecosystemLabel = config.ecosystem
const isTenantApp = computed(() => config.isTenant)
const allowAnonymousAuth = computed(() => !config.isTenant)
const ecosystemBrandLabel = computed(() =>
  ecosystemLabel === 'misebox' ? 'Misebox' : ecosystemLabel
)
const ecosystemBrandAlt = computed(() => `${ecosystemBrandLabel.value} ecosystem`)
const ecosystemWordmarkLight = '/img/ecosystem/wordmark-light.svg'
const ecosystemWordmarkDark = '/img/ecosystem/wordmark-dark.svg'

const { currentUser } = useUser()
const { pill: userInterface } = useUserInterface()
const currentUserPill = computed(() =>
  currentUser.value ? userInterface(currentUser.value) : null
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

const postAuthPath = computed(() => sanitizeRedirect(route.query.redirect) ?? '/dashboard')
const authenticatedPrimaryLabel = 'Go to dashboard'

watch(
  () =>
    [
      route.path,
      hasAuthState.value,
      isAuthenticated.value,
      postAuthPath.value,
      creatingUser.value,
    ] as const,
  async ([path, authReady, authenticated, target, creating]) => {
    if (path !== '/auth') return
    if (!authReady || !authenticated) return
    if (creating) return
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

const handleAnonymous = async () => {
  if (!allowAnonymousAuth.value) return
  if (anonymousLoading.value) return
  anonymousLoading.value = true
  try {
    const user = await signInAnonymous()
    if (user?.uid) {
      await router.push(postAuthPath.value).catch(() => {})
    }
  } finally {
    anonymousLoading.value = false
  }
}
</script>
