<template>
  <main class="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
    <div class="w-full space-y-6">
      <header class="space-y-2">
        <p class="text-xs uppercase tracking-[0.25em] text-primary/70">
          Misebox
        </p>
        <h1 class="text-3xl font-semibold text-primary-foreground">
          {{ title }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </header>

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
        <button class="link" type="button" @click="reload">Reload</button>
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

const reload = () => {
  if (import.meta.client) window.location.reload()
}
</script>
