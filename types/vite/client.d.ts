// Shim for Nuxt-generated `.nuxt/types/builder-env.d.ts` which does `import "vite/client";`.
// This avoids editor/TS resolution issues caused by Vite package `exports`.

interface ImportMetaEnv {
  readonly BASE_URL?: string
  readonly MODE?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
  readonly SSR?: boolean
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vite/client' {
  // The real Vite client types mostly augment global types (ImportMetaEnv).
  // Keeping this module empty is enough for TS to resolve the import.
  export {}
}
