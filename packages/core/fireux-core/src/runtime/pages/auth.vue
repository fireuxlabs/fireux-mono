<template>
  <div class="page">
    <UContainer class="max-w-md mx-auto py-12">
      <div class="space-y-10">
        <!-- App Logo and Branding -->
        <div class="text-center">
          <h1 class="text-2xl font-bold">Welcome to {{ appName }}</h1>
        </div>

        <!-- Auth System Component -->
        <OrganismsAuthSystem />

        <!-- App Info Section -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <!-- Debug Panel -->
        <section class="debug-panel">
          <header class="debug-panel__header">
            <h2 class="debug-title">Auth Debug</h2>
            <span class="debug-chip"
              >{{ config.role }} · {{ config.appId }}</span
            >
          </header>

          <div class="debug-actions">
            <UButton
              size="sm"
              color="primary"
              :loading="ensureLoading"
              @click="handleEnsureUser"
            >
              {{ ensureLoading ? 'Ensuring…' : 'Ensure User' }}
            </UButton>
            <UButton size="sm" variant="ghost" @click="handleRefresh">
              Refresh Page
            </UButton>
          </div>

          <p v-if="ensureStatus" class="debug-note">{{ ensureStatus }}</p>

          <dl class="debug-grid">
            <div>
              <dt>Auth state</dt>
              <dd>{{ summary.authState }}</dd>
            </div>
            <div>
              <dt>Auth resolved</dt>
              <dd>{{ summary.authResolved }}</dd>
            </div>
            <div>
              <dt>Signed in</dt>
              <dd>{{ summary.isSignedIn }}</dd>
            </div>
            <div>
              <dt>Core profile</dt>
              <dd>{{ summary.hasCoreProfile }}</dd>
            </div>
            <div>
              <dt>App profile</dt>
              <dd>{{ summary.hasAppProfile }}</dd>
            </div>
            <div>
              <dt>CTA key</dt>
              <dd>{{ summary.ctaKey }}</dd>
            </div>
            <div>
              <dt>Next CTA</dt>
              <dd>{{ summary.ctaLabel || '—' }}</dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd>{{ summary.userId || '—' }}</dd>
            </div>
          </dl>

          <pre class="debug-json"><code>{{ debugJson }}</code></pre>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUser } from '../composables/firestore/core/user/useUser'
import { useUserEnsure } from '../composables/firestore/core/user/useUserEnsure'
import { useHead } from '#imports'
import { useFireUXConfig } from '../composables/FireUXConfig'

const config = useFireUXConfig()
const appName = config.appName
const router = useRouter()
const { currentUser, authState } = useAuth()
const { user, cta, isSignedIn, hasCoreProfile, hasAppProfile } = useUser()
const { ensureUser } = useUserEnsure()

const ensureLoading = ref(false)
const ensureStatus = ref('')

const handleEnsureUser = async () => {
  if (ensureLoading.value) return
  ensureLoading.value = true
  ensureStatus.value = ''
  try {
    const result = await ensureUser()
    ensureStatus.value = `Ensure complete: core=${result.createdCore}, app=${result.createdApp}`
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : String(error)
    ensureStatus.value = `Ensure failed: ${message}`
  } finally {
    ensureLoading.value = false
  }
}

const handleRefresh = () => {
  router.go(0)
}

const summary = computed(() => ({
  authState: authState.value,
  authResolved: currentUser.value !== undefined,
  isSignedIn: isSignedIn.value,
  hasCoreProfile: hasCoreProfile.value,
  hasAppProfile: hasAppProfile.value,
  ctaKey: cta.value.key,
  ctaLabel: cta.value.label ?? '',
  ctaTo: cta.value.to ?? '',
  userId: user.value?.id ?? '',
  authUid: currentUser.value?.uid ?? '',
}))

const debugJson = computed(() =>
  JSON.stringify(
    {
      runtime: {
        role: config.role,
        appId: config.appId,
        ecosystem: config.ecosystem,
        modules: config.modules,
      },
      auth: {
        resolved: summary.value.authResolved,
        state: summary.value.authState,
        uid: summary.value.authUid,
        email: currentUser.value?.email ?? null,
        displayName: currentUser.value?.displayName ?? null,
      },
      user: user.value
        ? {
            id: user.value.id,
            core: user.value.core
              ? {
                  display_name: user.value.core.display_name,
                  avatar: user.value.core.avatar,
                  adminOf: user.value.core.adminOf,
                }
              : null,
            app: user.value.app
              ? {
                  display_name: user.value.app.display_name,
                  role: user.value.app.role,
                  handle: user.value.app.handle,
                }
              : null,
          }
        : null,
      cta: cta.value,
    },
    null,
    2
  )
)

// Only redirect logged-in users to dashboard if app is initialized
// For uninitialized apps, let the main app.vue handle the onboarding modal
// if (currentUser?.uid && !currentUser.isAnonymous) {
//   router.push('/dashboard')
// }

// Set page metadata
useHead({
  title: `Sign In - ${appName}`,
  meta: [
    {
      name: 'description',
      content: `Sign in to your ${appName} account to access all features and manage your profile.`,
    },
  ],
})

// Define page metadata for Nuxt
definePageMeta({
  layout: 'default',
  title: 'Authentication',
  icon: 'i-lucide-lock',
})
</script>

<style scoped>
.debug-panel {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.debug-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.debug-title {
  font-size: 1rem;
  font-weight: 600;
}

.debug-chip {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: rgba(59, 130, 246, 0.9);
  font-size: 0.75rem;
  font-weight: 500;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.debug-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.debug-note {
  font-size: 0.75rem;
  color: rgba(15, 23, 42, 0.65);
}

.debug-grid dt {
  font-size: 0.75rem;
  color: rgba(100, 116, 139, 0.9);
}

.debug-grid dd {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
}

.debug-json {
  margin: 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(15, 23, 42, 0.75);
  color: #f8fafc;
  font-size: 0.75rem;
  overflow-x: auto;
}

.debug-json code {
  font-family: ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas,
    Liberation Mono, Courier New, monospace;
}
</style>
