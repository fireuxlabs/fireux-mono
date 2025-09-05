import { addTemplate } from '@nuxt/kit'

/**
 * Configure error handling for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureErrors(_resolver: any, _nuxt: any) {
  // Provide a minimal centralized error page following Nuxt 4 defaults
  // Apps can override by creating their own error.vue
  addTemplate({
    filename: 'error.vue',
  getContents: () => `<script setup lang="ts">
// Use a structural type to avoid importing from app-only aliases in server runtime
type Err = { statusCode?: number; statusMessage?: string }

const props = defineProps<{ error?: Err }>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="cell error-page">
    <div class="cell-content">
  <h1 class="cell-title">{{ error?.statusCode || 500 }}</h1>
  <p class="cell-subtitle">{{ error?.statusMessage || 'Something went wrong' }}</p>
      <div class="cell-actions">
        <button @click="handleError">Try again</button>
        <a href="/">Go home</a>
      </div>
    </div>
  </div>
</template>`,
  })
}
