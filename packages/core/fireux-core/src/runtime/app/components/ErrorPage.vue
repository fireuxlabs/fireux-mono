<template>
  <main class="min-h-screen overflow-hidden bg-default text-default">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_36%)]"
    />

    <UContainer class="relative py-16 lg:py-24">
      <div class="grid gap-8 lg:grid-cols-[1.35fr,0.85fr]">
        <section class="space-y-6">
          <div class="space-y-4">
            <UBadge color="primary" variant="soft">
              {{ appName }}
            </UBadge>

            <div class="space-y-3">
              <p class="text-sm font-semibold uppercase tracking-[0.32em] text-primary">
                Error Surface
              </p>
              <h1 class="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {{ title }}
              </h1>
              <p class="max-w-2xl text-lg text-toned">
                {{ description }}
              </p>
              <p class="max-w-2xl text-sm text-muted">
                {{ supportCopy }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" color="primary" size="lg">
              Back to Home
            </UButton>
            <UButton
              v-if="authAction"
              :to="authAction.to"
              color="neutral"
              variant="soft"
              size="lg"
            >
              {{ authAction.label }}
            </UButton>
            <UButton
              v-if="showGetStarted"
              to="/get-started"
              color="neutral"
              variant="soft"
              size="lg"
            >
              Get Started
            </UButton>
            <UButton color="neutral" variant="outline" size="lg" @click="reload">
              Reload
            </UButton>
            <UButton color="neutral" variant="ghost" size="lg" @click="clearError({ redirect: '/' })">
              Dismiss
            </UButton>
          </div>
        </section>

        <UCard class="border-primary/20 bg-default/90 shadow-xl shadow-primary/5 backdrop-blur">
          <div class="space-y-5">
            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Status
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge color="primary" variant="soft">
                  {{ statusLabel }}
                </UBadge>
                <UBadge v-if="resolvedError?.statusCode" color="neutral" variant="soft">
                  {{ resolvedError.statusCode }}
                </UBadge>
              </div>
            </div>

            <USeparator />

            <div v-if="isFirebaseAdminCredentialError" class="space-y-3">
              <p class="text-sm font-medium text-highlighted">
                Firebase Admin could not initialize credentials.
              </p>
              <ul class="space-y-2 text-sm text-toned">
                <li class="flex gap-2">
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>If this runtime uses Application Default Credentials, verify its workload identity or default service account and Firebase IAM access.</span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Otherwise configure <code>GOOGLE_APPLICATION_CREDENTIALS</code>, <code>FIREBASE_SERVICE_ACCOUNT_FILE</code>, inline service-account JSON, or the split <code>FIREBASE_*</code> keys.</span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Local ADC that mints custom tokens may also need <code>FIREBASE_SERVICE_ACCOUNT_ID</code> and IAM <code>signBlob</code> permission.</span>
                </li>
              </ul>
            </div>

            <div v-else class="space-y-3">
              <p class="text-sm font-medium text-highlighted">
                What you can do now
              </p>
              <ul class="space-y-2 text-sm text-toned">
                <li
                  v-for="step in recoverySteps"
                  :key="step"
                  class="flex gap-2"
                >
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{{ step }}</span>
                </li>
              </ul>
            </div>

            <UAlert
              v-if="contactEmail"
              color="neutral"
              variant="soft"
              title="Support"
              :description="`If this keeps happening, contact ${contactEmail}.`"
            />
          </div>
        </UCard>
      </div>

      <section
        v-if="resolvedError?.message"
        class="mt-8 rounded-3xl border border-default bg-default/80 p-6 shadow-sm"
      >
        <div class="space-y-3">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Technical details
            </p>
            <p class="text-sm text-muted">
              Raw error output for debugging and support.
            </p>
          </div>

          <pre class="max-h-[28rem] overflow-auto rounded-2xl bg-inverted px-4 py-4 text-xs text-inverted">{{ resolvedError.message }}</pre>
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { clearError, useError, useRouter, useRuntimeConfig, type NuxtError } from 'nuxt/app';
import { computed } from 'vue';

const props = defineProps<{
  error?: NuxtError
}>()

const router = useRouter()
const runtimeConfig = useRuntimeConfig()

type AnyRecord = Record<string, unknown>

const publicConfig = computed<AnyRecord>(() => {
  const pub = (runtimeConfig.public ?? {}) as AnyRecord
  return (pub.fireux ?? {}) as AnyRecord
})

const appName = computed(() => {
  const value = publicConfig.value.name
  return typeof value === 'string' && value.trim() ? value.trim() : 'FireUX'
})

const contactEmail = computed(() => {
  const value = publicConfig.value.contactEmail
  return typeof value === 'string' && value.trim() ? value.trim() : ''
})

const resolvedError = computed<NuxtError | null>(() => props.error ?? useError().value ?? null)

const hasRoutePath = (path: string) =>
  router.getRoutes().some((route) => route.path === path)

const statusCode = computed(() => Number(resolvedError.value?.statusCode || 0))

const title = computed(() => {
  if (statusCode.value === 401) return 'Sign in required'
  if (statusCode.value === 403) return 'Access denied'
  if (statusCode.value === 404) return 'Page not found'
  return 'Something went wrong'
})

const description = computed(() => {
  if (statusCode.value === 401) return `You need to sign in before ${appName.value} can open this page.`
  if (statusCode.value === 403) return `${appName.value} rejected this request because your account does not have access to this surface.`
  if (statusCode.value === 404) return `The page you requested does not exist in ${appName.value}.`
  return `A server error occurred while rendering ${appName.value}.`
})

const statusLabel = computed(() => {
  if (statusCode.value === 401) return 'Auth Required'
  if (statusCode.value === 403) return 'Forbidden'
  if (statusCode.value === 404) return 'Not Found'
  if (statusCode.value >= 500) return 'Server Error'
  if (statusCode.value >= 400) return 'Request Error'
  return 'Render Failure'
})

const isFirebaseAdminCredentialError = computed(() => {
  const message = String(resolvedError.value?.message ?? '')
  return (
    message.includes('Service account object must contain a string "private_key"') ||
    message.includes('private_key is missing in GOOGLE_APPLICATION_CREDENTIALS') ||
    message.includes('Failed to parse service account') ||
    message.includes('Could not load the default credentials') ||
    message.includes('Unable to detect a Project Id') ||
    message.includes('Unable to detect a Project ID')
  )
})

const showGetStarted = computed(() =>
  isFirebaseAdminCredentialError.value && hasRoutePath('/get-started')
)

const authAction = computed(() => {
  if ((statusCode.value === 401 || statusCode.value === 403) && hasRoutePath('/auth')) {
    return {
      label: statusCode.value === 401 ? 'Sign In' : 'Go to Auth',
      to: '/auth',
    }
  }

  return null
})

const supportCopy = computed(() => {
  if (isFirebaseAdminCredentialError.value) {
    return 'The app is running, but Firebase Admin could not initialize from explicit credentials or the runtime ADC environment.'
  }

  if (statusCode.value === 401 || statusCode.value === 403) {
    return 'Authentication and workspace permissions are enforced separately, so this page is showing the access boundary instead of failing silently.'
  }

  return 'This is the shared FireUX fallback surface. It keeps the app readable, gives the next action, and preserves the raw error when you need it.'
})

const recoverySteps = computed(() => {
  if (statusCode.value === 401) {
    return [
      'Sign in with the account that owns or operates this app surface.',
      'Retry the route after authentication has completed.',
      'If access still fails, confirm the account has the required workspace scope.',
    ]
  }

  if (statusCode.value === 403) {
    return [
      'Return to a surface your account can access.',
      'Check whether this account has the right workspace scope or membership.',
      'Open the technical details below if you need the raw message for debugging.',
    ]
  }

  return [
    'Try the request again in case this was a transient render failure.',
    'Return to the public landing page and re-enter the route from a clean state.',
    'Open the technical details below if you need the raw message for debugging.',
  ]
})

const reload = () => {
  if (import.meta.client) window.location.reload()
}
</script>
