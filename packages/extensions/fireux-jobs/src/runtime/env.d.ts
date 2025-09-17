// Minimal ambient types for Nuxt auto-imports in isolated tsc
// This file is only for typechecking convenience inside the module package.

export {}

declare const definePageMeta: (meta: Record<string, any>) => void

declare module '#app' {
  const useRoute: () => any
  const useRouter: () => any
}
