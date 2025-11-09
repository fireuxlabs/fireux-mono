declare module '#pwa' {
  import type { ComputedRef } from 'vue'

  export interface PWAIcon {
    image?: string
    src?: string
    [key: string]: unknown
  }

  export function useTransparentPwaIcon(image?: unknown): {
    icon: ComputedRef<PWAIcon | undefined>
  }
  export function useMaskablePwaIcon(image?: unknown): {
    icon: ComputedRef<PWAIcon | undefined>
  }
  export function useFaviconPwaIcon(image?: unknown): {
    icon: ComputedRef<PWAIcon | undefined>
  }
  export function useApplePwaIcon(image?: unknown): {
    icon: ComputedRef<PWAIcon | undefined>
  }
  export function useAppleSplashScreenPwaIcon(image?: unknown): {
    icon: ComputedRef<PWAIcon | undefined>
  }
  export function usePWA(): unknown
}
