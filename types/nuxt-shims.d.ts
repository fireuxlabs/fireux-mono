// types/nuxt-shims.d.ts
// Standalone package declarations for Nuxt-generated imports.
// Applications use their generated declarations and must exclude this bridge.
import type {} from '../packages/core/fireux-core/src/types/runtime-config'

// Standalone package bridge for the generated Nuxt imports module.
  // Re-export everything Nuxt normally auto-imports
  export * from 'nuxt/app'

  /**
   * Optional: color mode composable used in your core runtime.
   * This is a light-weight type so TS is happy in packages.
   * The actual implementation still comes from your Nuxt modules (@nuxt/ui / color-mode).
   */
  export function useColorMode(): {
    value: string
    preference?: string
    unknown?: boolean
  }

  // Explicit re-export so TS always sees the macro
  export const definePageMeta: typeof import('../node_modules/nuxt/dist/pages/runtime/composables')['definePageMeta']

  export { ref, computed, reactive, watch, watchEffect, onErrorCaptured } from 'vue'

  // Common Nuxt composables/macros used across package runtime.
  // Reuse framework signatures; never erase consumer types with loose overloads.
  export const useRoute: typeof import('nuxt/app')['useRoute']
  export const useRouter: typeof import('nuxt/app')['useRouter']
  export const navigateTo: typeof import('nuxt/app')['navigateTo']
  export const useHead: typeof import('nuxt/app')['useHead']
  export const useSeoMeta: typeof import('nuxt/app')['useSeoMeta']
  export const useToast: typeof import('../node_modules/@nuxt/ui/dist/runtime/composables/useToast')['useToast']
  export const useFetch: typeof import('nuxt/app')['useFetch']
  export const useNuxtApp: typeof import('nuxt/app')['useNuxtApp']

  // Minimal shims for package-context runtime plugins.
  // (In real apps these come from Nuxt-generated `#imports` types.)
  export const defineNuxtPlugin: typeof import('nuxt/app')['defineNuxtPlugin']
  export const useRuntimeConfig: typeof import('nuxt/app')['useRuntimeConfig']
  export const useRequestEvent: typeof import('nuxt/app')['useRequestEvent']

// Minimal shim for vuefire server utilities used in package runtime plugins.
declare module 'vuefire/server' {
  export function ensureAdminApp(options?: any): any
}

/**
 * Shim for `#app` so you can import from it in packages
 * (runtime app context, defineNuxtPlugin, etc.)
 */


/**
 * Shim for `#build` – some Nuxt internals / modules import this.
 * You usually don't need strong typing here, just avoid TS errors.
 */
declare module '#build' {
  const _default: any
  export default _default
}

declare global {
  const defineAppConfig: typeof import('nuxt/app')['defineAppConfig']
  const computed: typeof import('vue')['computed']
  const definePageMeta: typeof import('../node_modules/nuxt/dist/pages/runtime/composables')['definePageMeta']
  const useRoute: typeof import('nuxt/app')['useRoute']
  const useRouter: typeof import('nuxt/app')['useRouter']
  const navigateTo: typeof import('nuxt/app')['navigateTo']
  const useHead: typeof import('nuxt/app')['useHead']
  const useSeoMeta: typeof import('nuxt/app')['useSeoMeta']
  const useFetch: typeof import('nuxt/app')['useFetch']
  const useAsyncData: typeof import('nuxt/app')['useAsyncData']
  const useNuxtApp: typeof import('nuxt/app')['useNuxtApp']
  const createError: typeof import('h3')['createError']
  const setResponseStatus: typeof import('h3')['setResponseStatus']
}

declare module '*.png' {
  const src: string
  export default src
}

export {}
