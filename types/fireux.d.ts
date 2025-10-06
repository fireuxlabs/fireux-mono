// Central ambient types for FIReUX
declare module '@vueup/vue-quill'

// Provide a permissive declaration for the virtual '#pwa' module used by @vite-pwa/nuxt runtime components.
// This satisfies typechecking in node_modules without tightly coupling to internal types.
declare module '#pwa' {
  // Icon composables exported by @vite-pwa/nuxt runtime
  export function useApplePwaIcon(image: any): {
    icon: import('vue').ComputedRef<any | undefined>
  }
  export function useAppleSplashScreenPwaIcon(image: any): {
    icon: import('vue').ComputedRef<any | undefined>
  }
  export function useFaviconPwaIcon(image: any): {
    icon: import('vue').ComputedRef<any | undefined>
  }
  export function useMaskablePwaIcon(image: any): {
    icon: import('vue').ComputedRef<any | undefined>
  }
  export function useTransparentPwaIcon(image: any): {
    icon: import('vue').ComputedRef<any | undefined>
  }

  // Optional helper to access PWA injection
  export function usePWA(): any
}

declare module '#fireux-core-runtime/*' {
  const component: any
  export default component
}

declare const useProfile: typeof import('#fireux-core-runtime/composables/firestore/profiles/useProfile').useProfile
declare const useFireUXConfig: typeof import('#fireux-core-runtime/composables/FireUXConfig').useFireUXConfig
declare const useFirestoreUtils: typeof import('#fireux-core-runtime/composables/firestore/useFirestoreUtils').useFirestoreUtils
declare const useFirestoreUpdate: typeof import('#fireux-core-runtime/composables/firestore/useFirestoreUpdate').useFirestoreUpdate
declare const useImageStorage: typeof import('#fireux-core-runtime/composables/firebase/useImageStorage').useImageStorage
