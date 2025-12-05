declare module '#imports' {
  export * from 'nuxt/app'
}

declare module '#pwa' {
  export * from '@vite-pwa/nuxt/dist/runtime/composables/index.d.ts'
}

export {}

declare global {
  const defineAppConfig: typeof import('nuxt/app')['defineAppConfig']
  const defineNuxtConfig: typeof import('nuxt/app')['defineNuxtConfig']
  const defineNuxtPlugin: typeof import('nuxt/app')['defineNuxtPlugin']
  const defineNuxtRouteMiddleware: typeof import('nuxt/app')['defineNuxtRouteMiddleware']
  const definePageMeta: typeof import('nuxt/app')['definePageMeta']
  const navigateTo: typeof import('nuxt/app')['navigateTo']
  const preloadComponents: typeof import('nuxt/app')['preloadComponents']
  const preloadRouteComponents: typeof import('nuxt/app')['preloadRouteComponents']
  const useAppConfig: typeof import('nuxt/app')['useAppConfig']
  const useAsyncData: typeof import('nuxt/app')['useAsyncData']
  const useLazyAsyncData: typeof import('nuxt/app')['useLazyAsyncData']
  const useLazyFetch: typeof import('nuxt/app')['useLazyFetch']
  const useNuxtApp: typeof import('nuxt/app')['useNuxtApp']
  const useNuxtData: typeof import('nuxt/app')['useNuxtData']
  const useRoute: typeof import('nuxt/app')['useRoute']
  const useRuntimeConfig: typeof import('nuxt/app')['useRuntimeConfig']
  const useState: typeof import('nuxt/app')['useState']
}
