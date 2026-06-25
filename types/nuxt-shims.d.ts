// types/nuxt-shims.d.ts
// Global Nuxt shims so packages (like fireux-core, fireux-jobs, fireux-misebox)
// can use Nuxt virtual modules (#imports, #app, #build) without TS/VS Code errors.

declare module '#imports' {
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
  export const definePageMeta: typeof import('nuxt/app')['definePageMeta']

  // In some package contexts VS Code/tsserver may not resolve `vue` types.
  // Provide loose shims for common Vue composables used in SFCs.
  export function ref<T = any>(value?: T): any
  export function computed<T = any>(getter: (...args: any[]) => T): any
  export function reactive<T extends object>(value: T): T
  export function watch(...args: any[]): any
  export function watchEffect(...args: any[]): any
  export function onErrorCaptured(...args: any[]): any

  // Common Nuxt composables/macros used across package runtime.
  // Keep these as loose types; real types come from app-generated .nuxt d.ts.
  export function useRoute(...args: any[]): any
  export function useRouter(...args: any[]): any
  export function navigateTo(...args: any[]): any
  export function useHead(...args: any[]): any
  export function useSeoMeta(...args: any[]): any
  export function useToast(...args: any[]): any
  export function useFetch<T = any>(...args: any[]): any
  export function useNuxtApp(...args: any[]): any

  // Minimal shims for package-context runtime plugins.
  // (In real apps these come from Nuxt-generated `#imports` types.)
  export function defineNuxtPlugin(...args: any[]): any
  export function useRuntimeConfig(...args: any[]): any
  export function useRequestEvent(...args: any[]): any
}

// Minimal shim for vuefire server utilities used in package runtime plugins.
declare module 'vuefire/server' {
  export function ensureAdminApp(options?: any): any
}

/**
 * Shim for `#app` so you can import from it in packages
 * (runtime app context, defineNuxtPlugin, etc.)
 */
declare module '#app' {
  export * from 'nuxt/app'
}

/**
 * Shim for `#build` – some Nuxt internals / modules import this.
 * You usually don't need strong typing here, just avoid TS errors.
 */
declare module '#build' {
  const _default: any
  export default _default
}

declare global {
  function defineAppConfig(...args: any[]): any
  const computed: typeof import('vue')['computed']
  const definePageMeta: typeof import('nuxt/app')['definePageMeta']
  function useRoute(...args: any[]): any
  function useRouter(...args: any[]): any
  function navigateTo(...args: any[]): any
  function useHead(...args: any[]): any
  function useSeoMeta(...args: any[]): any
  function useFetch<T = any>(...args: any[]): any
  function useAsyncData<T = any>(...args: any[]): any
  function useNuxtApp(...args: any[]): any
  function createError(...args: any[]): any
  function setResponseStatus(...args: any[]): any
}

declare module '*.png' {
  const src: string
  export default src
}

export {}
