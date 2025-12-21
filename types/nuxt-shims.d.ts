// types/nuxt-shims.d.ts
// Global Nuxt shims so packages (like fireux-core, fireux-jobs, fireux-misebox)
// can use Nuxt virtual modules (#imports, #app, #build) without TS/VS Code errors.

declare module '#imports' {
  // Re-export everything Nuxt normally auto-imports
  export * from 'nuxt/app'

  // Also make Vue exports available for SFC script setup convenience
  export * from 'vue'

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

export {}
