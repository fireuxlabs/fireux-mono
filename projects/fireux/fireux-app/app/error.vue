<template>
  <main class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
    <div class="w-full space-y-6">
      <header class="space-y-2">
        <p class="text-xs uppercase tracking-[0.25em] text-primary/70">
          FireUX Platform
        </p>
        <h1 class="text-3xl font-semibold text-primary-foreground">
          {{ title }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </header>

      <section v-if="isFirebaseAdminCredentialError" class="space-y-3">
        <p class="text-sm text-muted-foreground">
          This usually means <code>GOOGLE_APPLICATION_CREDENTIALS</code> points
          to a JSON file that is not a Firebase service account (it’s missing
          <code>private_key</code>).
        </p>

        <div class="space-y-2 text-sm text-muted-foreground">
          <p class="font-medium text-primary-foreground">Fix options</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>
              Point <code>GOOGLE_APPLICATION_CREDENTIALS</code> to a Firebase
              service-account JSON file.
            </li>
            <li>
              Or set <code>FIREBASE_PROJECT_ID</code>,
              <code>FIREBASE_CLIENT_EMAIL</code>, and
              <code>FIREBASE_PRIVATE_KEY</code>.
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink class="link" to="/getting-started">Getting started →</NuxtLink>
          <button class="link" type="button" @click="reload">Reload</button>
        </div>
      </section>

      <details v-if="error?.message" class="rounded-xl border border-border/70 bg-card p-4">
        <summary class="cursor-pointer text-sm font-medium text-primary-foreground">
          Technical details
        </summary>
        <pre class="mt-3 overflow-auto text-xs text-muted-foreground">{{ error.message }}</pre>
      </details>

      <div class="flex flex-wrap gap-3">
        <NuxtLink class="link" to="/">Home</NuxtLink>
        <button class="link" type="button" @click="clearError({ redirect: '/' })">
          Dismiss
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const title = computed(() => {
  const statusCode = props.error?.statusCode
  if (statusCode === 404) return 'Page not found'
  return 'Something went wrong'
})

const description = computed(() => {
  const statusCode = props.error?.statusCode
  if (statusCode === 404) return 'The page you requested does not exist.'
  return 'A server error occurred while rendering this page.'
})

const isFirebaseAdminCredentialError = computed(() => {
  const message = String(props.error?.message ?? '')
  return (
    message.includes('Service account object must contain a string "private_key"') ||
    message.includes('private_key is missing in GOOGLE_APPLICATION_CREDENTIALS') ||
    message.includes('Failed to parse service account')
  )
})

const reload = () => {
  if (import.meta.client) window.location.reload()
}
</script>
