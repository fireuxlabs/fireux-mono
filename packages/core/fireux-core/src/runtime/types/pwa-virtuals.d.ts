// TODO: remove once PWA 
declare module '#pwa' {
  export function useApplePwaIcon(): any
  export function useAppleSplashScreenPwaIcon(): any
  export function useFaviconPwaIcon(): any
  export function useMaskablePwaIcon(): any
  export function useTransparentPwaIcon(): any
}

declare module '#build/pwa-icons/*' {
  export type PwaAppleImageProps = any
  export type PwaAppleSplashScreenImageProps = any
  export type PwaFaviconImageProps = any
  export type PwaMaskableImageProps = any
  export type PwaTransparentImageProps = any
}

declare module '#build/pwa-icons/pwa-icons' {
  export interface PWAAssetIcon { url: string; name?: string; width?: number; height?: number }
  export type PWAIcons = Record<string, any>
}