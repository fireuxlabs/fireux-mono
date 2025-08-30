import { addTemplate } from '@nuxt/kit'

/**
 * Configure error handling for the Nuxt application
 * @param _resolver The resolver instance to resolve file paths (unused)
 * @param _nuxt The Nuxt instance (unused)
 */
export function configureErrors(_resolver: any, _nuxt: any) {
  // Provide a minimal centralized error page following Nuxt 4 defaults
  // Apps can override by creating their own error.vue
  addTemplate({
    filename: 'error.vue',
    getContents: () => `<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-gray-900">{{ error?.statusCode || 500 }}</h1>
      <p class="text-gray-600">{{ error?.statusMessage || 'Something went wrong' }}</p>
      <div class="space-x-4">
        <button 
          @click="handleError" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
        <a 
          href="/" 
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Go home
        </a>
      </div>
    </div>
  </div>
</template>`,
  })
}
